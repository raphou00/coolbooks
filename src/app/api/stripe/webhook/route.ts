import { type NextRequest, NextResponse } from "next/server";
import {
    handleInvoicePayment,
    handleSubscriptionChange,
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
        const eventData = event.data.object as Stripe.Subscription | Stripe.Invoice;
        const customerId = eventData.customer;

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

        let invoice: Stripe.Invoice;
        switch (event.type) {
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
                await handleSubscriptionChange(eventData as Stripe.Subscription, user);
                break;
            case "invoice.payment_succeeded":
                invoice = eventData as Stripe.Invoice;
                if (invoice.subscription) {
                    await handleInvoicePayment(invoice, user);
                }
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
