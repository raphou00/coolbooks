import Stripe from "stripe";
import { title } from "@/config/seo";
import env from "./env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-10-29.clover",
    appInfo: {
        name: title,
        url: env.APP_URL,
    },
});
