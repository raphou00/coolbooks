import { type NextRequest, NextResponse } from "next/server";
import { handleSubscriptionChange, stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import env from "@/lib/env";
import db from "@/lib/db";
import { headers } from "next/headers";

export const config = {
    api: {
        bodyParser: false,
    },
};

export const POST = async (req: NextRequest) => {
    try {
        const payload = await req.text();
        const header = await headers();
        const signature = header.get("stripe-signature") as string;

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
            console.error("Missing customer ID");
            return NextResponse.json(
                { error: "Missing customer ID" },
                { status: 400 }
            );
        }

        const stripeUser = await stripe.customers.retrieve(
            customerId as string
        );
        const stripeUserEmail = (stripeUser as Stripe.Customer).email;
        console.log("stripeUserEmail", stripeUserEmail);

        if (!stripeUserEmail) {
            console.error("Missing user");
            return NextResponse.json(
                { error: "Missing user" },
                { status: 400 }
            );
        }

        const user = await db.user.findUnique({
            where: {
                email: stripeUserEmail,
            },
        });

        if (!user) {
            console.error("Missing user");
            return NextResponse.json(
                { error: "Missing user" },
                { status: 400 }
            );
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
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
};
