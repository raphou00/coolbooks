import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import env from "@/lib/env";
import db from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { startGeneration } from "@/lib/orders";

/**
 * Mark the order paid and start its book, exactly once. Stripe can deliver
 * the same event several times; only the first PENDING → PAID flip wins.
 */
const markPaid = async (session: Stripe.Checkout.Session) => {
    const orderId = session.metadata?.orderId;
    if (!orderId) {
        console.warn(`Checkout ${session.id} has no orderId`);
        return;
    }

    const shipping = session.collected_information?.shipping_details;
    const paymentIntentId =
        typeof session.payment_intent === "string" ?
            session.payment_intent
        :   (session.payment_intent?.id ?? null);

    const updated = await db.orders.transition(orderId, ["PENDING"], {
        status: "PAID",
        paidAt: new Date(),
        stripeSessionId: session.id,
        paymentIntentId,
        shipping: shipping ? JSON.parse(JSON.stringify(shipping)) : null,
    });
    if (!updated) return; // already handled

    try {
        await startGeneration(orderId);
    } catch (err) {
        // The order stays PAID; the order sweeper will start it again.
        console.error(`Could not start book for order ${orderId}`, err);
    }
};

export const POST = async (req: NextRequest) => {
    const payload = await req.text();
    const signature = req.headers.get("stripe-signature") ?? "";

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

    try {
        switch (event.type) {
            case "checkout.session.completed":
            case "checkout.session.async_payment_succeeded": {
                const session = event.data.object;
                if (session.payment_status === "paid") {
                    await markPaid(session);
                }
                break;
            }
            default:
                break;
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
