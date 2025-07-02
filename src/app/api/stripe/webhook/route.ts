import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { handleSubscriptionChange, stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import env from "@/lib/env";
import { getUser } from "@/lib/auth";

export const GET = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
    });
    try {
        const user = await getUser();

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        const payload = await req.text();
        const signature = req.headers.get("stripe-signature") as string;
        let event: Stripe.Event;

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
        switch (event.type) {
            case "customer.subscription.updated":
            case "customer.subscription.deleted":
                await handleSubscriptionChange(subscription, user.user);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
