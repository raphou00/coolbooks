import Stripe from "stripe";
import { title } from "@/config/seo";
import env from "./env";

// A placeholder key keeps local mode bootable with mock payments.
export const stripe = new Stripe(env.STRIPE_SECRET_KEY || "sk_test_local", {
    apiVersion: "2026-10-28.endive",
    appInfo: {
        name: title,
        url: env.APP_URL,
    },
});
