import Stripe from "stripe";
import env from "./env";
import { title } from "@/config/seo";
import type { User } from "lucia";
import db from "./db";
import type { TranslationsFunc } from "./types";
import { productId } from "@/config/stripe";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
    appInfo: {
        name: title,
        url: env.APP_URL,
    },
});

export const handleSubscriptionChange = async (
    subscription: Stripe.Subscription,
    user: User
) => {
    const subscriptionId = subscription.id;
    const status = subscription.status;

    if (status === "active" || status === "trialing") {
        const plan = subscription.items.data[0]?.plan;
        await db.user.update({
            where: {
                id: user.id,
            },
            data: {
                stripeSubscriptionId: subscriptionId,
                stripeProductId: plan?.product as string,
                subscriptionStatus: status,
            },
        });
    } else if (status === "canceled" || status === "unpaid") {
        await db.user.update({
            where: {
                id: user.id,
            },
            data: {
                stripeSubscriptionId: null,
                stripeProductId: null,
                subscriptionStatus: status,
            },
        });
    }
};

export const getSubscription = async (t: TranslationsFunc) => {
    const prices = await stripe.prices.list({ product: productId });

    const tiers = {
        name: t("subscription.title"),
        description: t("subscription.description"),
        price: prices.data[0].unit_amount! / 100,
        priceId: prices.data[0].id,
    };

    return tiers;
};
