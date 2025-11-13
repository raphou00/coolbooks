import Stripe from "stripe";
import env from "./env";
import { title } from "@/config/seo";
import type { User } from "@prisma/client";
import db from "./db";
import type { T } from "./types";
import {
    productIdBasic,
    productIdFamily,
    productIdPremium,
} from "@/config/stripe";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-10-29.clover",
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
    } else if (status === "past_due" || status === "incomplete") {
        await db.user.update({
            where: {
                id: user.id,
            },
            data: {
                subscriptionStatus: status,
            },
        });
    }
};

export const handleSubscriptionDeleted = async (
    subscription: Stripe.Subscription,
    user: User
) => {
    await db.user.update({
        where: {
            id: user.id,
        },
        data: {
            stripeSubscriptionId: null,
            stripeProductId: null,
            subscriptionStatus: "canceled",
        },
    });
};

export const handlePaymentFailed = async (
    invoice: Stripe.Invoice,
    user: User
) => {
    await db.user.update({
        where: {
            id: user.id,
        },
        data: {
            subscriptionStatus: "past_due",
        },
    });

    console.log(`Payment failed for user ${user.email}`);
};

export const handleInvoicePayment = async (
    invoice: Stripe.Invoice,
    user: User
) => {
    let creditsToAdd = 0;

    const subscriptionId = (invoice as unknown as { subscription: string })
        .subscription;
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id;

    const priceBasic = await stripe.prices.search({
        query: `product:"${productIdBasic}"`,
    });
    const priceFamily = await stripe.prices.search({
        query: `product:"${productIdFamily}"`,
    });
    const pricePremium = await stripe.prices.search({
        query: `product:"${productIdPremium}"`,
    });

    switch (priceId) {
        case priceBasic.data[0].id:
            creditsToAdd = 5;
            break;
        case priceFamily.data[0].id:
            creditsToAdd = 10;
            break;
        case pricePremium.data[0].id:
            creditsToAdd = 20;
            break;
    }

    await db.user.update({
        where: {
            id: user.id,
        },
        data: {
            credits: {
                increment: creditsToAdd,
            },
        },
    });

    console.log(`Added ${creditsToAdd} credits to user ${user.email}`);
};

export const getSubscription = async (t: T) => {
    const priceBasic = await stripe.prices.search({
        query: `product:"${productIdBasic}"`,
    });
    const priceFamily = await stripe.prices.search({
        query: `product:"${productIdFamily}"`,
    });
    const pricePremium = await stripe.prices.search({
        query: `product:"${productIdPremium}"`,
    });

    const tiers = [
        {
            name: t("pages.pricing.subscriptions.basic.title"),
            description: t("pages.pricing.subscriptions.basic.description"),
            features: [
                t("pages.pricing.subscriptions.basic.features.0"),
                t("pages.pricing.subscriptions.basic.features.1"),
                t("pages.pricing.subscriptions.basic.features.2"),
            ],
            price: priceBasic.data[0].unit_amount! / 100,
            priceId: priceBasic.data[0].id,
        },
        {
            name: t("pages.pricing.subscriptions.family.title"),
            description: t("pages.pricing.subscriptions.family.description"),
            features: [
                t("pages.pricing.subscriptions.family.features.0"),
                t("pages.pricing.subscriptions.family.features.1"),
                t("pages.pricing.subscriptions.family.features.2"),
            ],
            price: priceFamily.data[0].unit_amount! / 100,
            priceId: priceFamily.data[0].id,
            popular: true,
        },
        {
            name: t("pages.pricing.subscriptions.premium.title"),
            description: t("pages.pricing.subscriptions.premium.description"),
            features: [
                t("pages.pricing.subscriptions.premium.features.0"),
                t("pages.pricing.subscriptions.premium.features.1"),
                t("pages.pricing.subscriptions.premium.features.2"),
            ],
            price: pricePremium.data[0].unit_amount! / 100,
            priceId: pricePremium.data[0].id,
        },
    ];

    return tiers;
};
