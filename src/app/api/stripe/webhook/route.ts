import { NextResponse } from "next/server";
import { handleSubscriptionChange, stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import type { Readable } from "stream";
import env from "@/lib/env";
import db from "@/lib/db";

export const runtime = "nodejs";

function buffer(readable: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Uint8Array[] = [];
        readable.on("data", (chunk) => chunks.push(chunk));
        readable.on("end", () => resolve(Buffer.concat(chunks)));
        readable.on("error", reject);
    });
}

export const POST = async (req: Request) => {
    try {
        if (!req.body) {
            return NextResponse.json({
                error: "Missing body",
            });
        }
        const buf = await buffer(req.body as unknown as Readable);
        const payload = buf.toString("utf8");
        const signature = req.headers.get("stripe-signature") as string;
        let event: Stripe.Event;

        console.log("Signature:", signature);
        console.log("Payload:", payload);

        console.log("Webhook secret:", env.STRIPE_WEBHOOK_SECRET);

        try {
            event = stripe.webhooks.constructEvent(
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

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };
