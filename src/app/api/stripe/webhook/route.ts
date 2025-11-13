import { type NextRequest, NextResponse } from "next/server";
import {
    handleInvoicePayment,
    handlePaymentFailed,
    handleSubscriptionChange,
    handleSubscriptionDeleted,
    stripe,
} from "@/lib/stripe";
import type Stripe from "stripe";
import env from "@/lib/env";
import db from "@/lib/db";
import { headers } from "next/headers";

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
        const eventData = event.data.object as
            | Stripe.Subscription
            | Stripe.Invoice;

        let customerId = eventData.metadata?.userId;

        if (!customerId) {
            customerId = (eventData as Stripe.Invoice).parent
                ?.subscription_details?.metadata?.userId;

            if (!customerId) {
                console.error("Missing user id");
                return NextResponse.json(
                    { error: "Missing user id" },
                    { status: 400 }
                );
            }
        }

        const user = await db.user.findUnique({
            where: {
                id: customerId.toString(),
            },
        });

        if (!user) {
            console.error("Missing user in db");
            return NextResponse.json(
                { error: "Missing user in db" },
                { status: 400 }
            );
        }

        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
                await handleSubscriptionChange(
                    eventData as Stripe.Subscription,
                    user
                );
                break;
            case "customer.subscription.deleted":
                await handleSubscriptionDeleted(
                    eventData as Stripe.Subscription,
                    user
                );
                break;
            case "invoice.payment_succeeded":
                await handleInvoicePayment(eventData as Stripe.Invoice, user);
                break;
            case "invoice.payment_failed":
                await handlePaymentFailed(eventData as Stripe.Invoice, user);
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
