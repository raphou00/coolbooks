import { type NextRequest, NextResponse } from "next/server";
import { handleSubscriptionChange, stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import env from "@/lib/env";
import db from "@/lib/db";
import { headers } from "next/headers";
import { Readable } from "stream";

export const runtime = "nodejs";

export const config = {
    api: {
        bodyParser: false,
    },
};

function toBuffer(readable: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        readable.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        readable.on("end", () => resolve(Buffer.concat(chunks)));
        readable.on("error", reject);
    });
}

export const POST = async (req: NextRequest) => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const readable = Readable.fromWeb(req.body as any);
        const body = await toBuffer(readable);
        const payload = body.toString();
        const header = await headers();
        const signature = header.get("stripe-signature") as string;

        console.log("Signature:", signature);
        console.log("Payload:", payload);
        console.log("Webhook secret:", env.STRIPE_WEBHOOK_SECRET);

        let event: Stripe.Event;
        try {
            event = await stripe.webhooks.constructEventAsync(
                payload,
                signature,
                env.STRIPE_WEBHOOK_SECRET
            );
        } catch (err) {
            console.error("Webhook signature verification failed.", err);
            return NextResponse.json(
                { error: "Webhook signature verification failed." },
                { status: 400 }
            );
        }
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer;

        if (!customerId) {
            return NextResponse.json({
                error: "Missing customer ID",
            });
        }

        const stripeUser = await stripe.customers.retrieve(
            customerId as string
        );
        const stripeUserEmail = (stripeUser as Stripe.Customer).email;

        if (!stripeUserEmail) {
            return NextResponse.json({
                error: "Missing user",
            });
        }

        const user = await db.user.findUnique({
            where: {
                email: stripeUserEmail,
            },
        });

        if (!user) {
            return NextResponse.json({
                error: "Missing user",
            });
        }

        switch (event.type) {
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
                await handleSubscriptionChange(subscription, user);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            error: "Something went wrong",
        });
    }
};
