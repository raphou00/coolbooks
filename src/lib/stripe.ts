import Stripe from "stripe";
import env from "./env";
import { title } from "@/config/seo";
import type { User } from "lucia";
import db from "./db";

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
                id: user.id
            },
            data: {
                stripeSubscriptionId: subscriptionId,
                stripeProductId: plan?.product as string,
                planName: (plan?.product as Stripe.Product).name,
                subscriptionStatus: status
            }
        });
    } else if (status === "canceled" || status === "unpaid") {
        await db.user.update({
            where: {
                id: user.id
            },
            data: {
                stripeSubscriptionId: null,
                stripeProductId: null,
                planName: null,
                subscriptionStatus: status
            }
        })
    }
}

export const getStripePrices = async () => {
    const prices = await stripe.prices.list({
        expand: ["data.product"],
        active: true,
        type: "recurring"
    });

    return prices.data.map((price) => ({
        id: price.id,
        productId: typeof price.product === "string" ? price.product : price.product.id,
        unitAmount: price.unit_amount,
        currency: price.currency,
        interval: price.recurring?.interval,
        trialPeriodDays: price.recurring?.trial_period_days
    }));
}

export const getStripeProducts = async () => {
    const products = await stripe.products.list({
        active: true,
        expand: ["data.default_price"]
    });

    return products.data.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        defaultPriceId:
            typeof product.default_price === "string"
                ? product.default_price
                : product.default_price?.id
    }));
}
