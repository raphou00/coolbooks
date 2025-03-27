import Stripe from "stripe";
import env from "./env";
import { title } from "@/config/seo";
import { type Currency } from "@prisma/client";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
    appInfo: {
        name: title,
        url: env.APP_URL,
    },
});

export const getCurrencyConversionRate = async (
    from: Currency,
    to: Currency
) => {
    const rates = await stripe.exchangeRates.retrieve(from.toLowerCase());
    return rates.rates[to.toLowerCase()];
};
