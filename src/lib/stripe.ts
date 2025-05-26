import Stripe from "stripe";
import env from "./env";
import { title } from "@/config/seo";
import type { User } from "lucia";
import db from "./db";
import type { TranslationsFunc } from "./types";

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
                planName: (plan?.product as Stripe.Product).name,
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
                planName: null,
                subscriptionStatus: status,
            },
        });
    }
};

export const getTiers = async (t: TranslationsFunc) => {
    const prices = await stripe.prices.list({
        active: true,
    });

    const tiers = [
        {
            name: t("tiers.crush.title"),
            price:
                prices.data.find((price) => price.product === "crush")!
                    .unit_amount! / 100,
            priceId: prices.data.find((price) => price.product === "crush")!
                .id!,
            description: t("tiers.crush.description"),
            features: [
                t("tiers.crush.features.1"),
                t("tiers.crush.features.2"),
            ],
            color: "bg-indigo-600",
        },
        {
            name: t("tiers.lover.title"),
            price:
                prices.data.find((price) => price.product === "lover")!
                    .unit_amount! / 100,
            priceId: prices.data.find((price) => price.product === "lover")!
                .id!,
            description: t("tiers.lover.description"),
            features: [
                t("tiers.lover.features.1"),
                t("tiers.lover.features.2"),
                t("tiers.lover.features.3"),
            ],
            color: "bg-pink-600",
        },
    ];

    return tiers;
};
