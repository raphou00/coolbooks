import { NextResponse } from "next/server";
import { Readable } from "stream";
import { stripe } from "@/lib/stripe";
import env from "@/lib/env";
import db from "@/lib/db";
import { handleSubscriptionChange } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

function toBuffer(readable: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        readable.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        readable.on("end", () => resolve(Buffer.concat(chunks)));
        readable.on("error", reject);
    });
}

export async function POST(req: Request) {
    const readable = Readable.fromWeb(req.body! as any);
    const body = await toBuffer(readable);
    const sig = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;
    try {
        event = await stripe.webhooks.constructEventAsync(
            body,
            sig,
            env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error("❌ Webhook signature verification failed", err);
        return NextResponse.json(
            { error: "Invalid signature" },
            { status: 400 }
        );
    }

    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer;

    if (!customerId)
        return NextResponse.json(
            { error: "Missing customer ID" },
            { status: 400 }
        );

    const stripeUser = await stripe.customers.retrieve(customerId as string);
    const email = (stripeUser as Stripe.Customer).email;

    if (!email)
        return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const user = await db.user.findUnique({ where: { email } });

    if (!user)
        return NextResponse.json({ error: "User not found" }, { status: 400 });

    switch (event.type) {
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
            await handleSubscriptionChange(subscription, user);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}
