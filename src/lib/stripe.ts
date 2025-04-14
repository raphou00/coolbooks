import Stripe from "stripe";
import env from "./env";
import { title } from "@/config/seo";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
    appInfo: {
        name: title,
        url: env.APP_URL,
    },
});
