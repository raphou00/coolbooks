import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import env from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { markOrderPaid } from "@/lib/orders";

const markPaid = async (session: Stripe.Checkout.Session) => {
    const orderId = session.metadata?.orderId;
    if (!orderId) {
        console.warn(`Checkout ${session.id} has no orderId`);
        return;
    }

    const shipping = session.collected_information?.shipping_details;
    await markOrderPaid(orderId, {
        stripeSessionId: session.id,
        paymentIntentId:
            typeof session.payment_intent === "string" ?
                session.payment_intent
            :   (session.payment_intent?.id ?? null),
        shipping: shipping ? JSON.parse(JSON.stringify(shipping)) : null,
    });
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
