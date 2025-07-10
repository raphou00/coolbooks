import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripe";
import env from "@/lib/env";
import db from "@/lib/db";
import { handleSubscriptionChange } from "@/lib/stripe";
import type Stripe from "stripe";

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") return res.status(405).end();

    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"] as string;

    let event: Stripe.Event;
    try {
        event = await stripe.webhooks.constructEventAsync(
            buf,
            sig,
            "we_1RQzKaEKzrq4BNS54beKRjF4"
        );
    } catch (err) {
        console.error("❌ Signature verification failed:", err);
        return res.status(400).send("Webhook Error: Invalid signature");
    }

    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer;

    if (!customerId) return res.status(400).send("Missing customer ID");

    const stripeUser = await stripe.customers.retrieve(customerId as string);
    const email = (stripeUser as Stripe.Customer).email;

    if (!email) return res.status(400).send("Missing email");

    const user = await db.user.findUnique({ where: { email } });
    if (!user) return res.status(400).send("User not found");

    switch (event.type) {
        case "customer.subscription.updated":
        case "customer.subscription.deleted":
            await handleSubscriptionChange(subscription, user);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return res.status(200).json({ received: true });
}
