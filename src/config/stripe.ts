import env from "@/lib/env";

export const currency = "USD" as const;
export const productIdBasic = env.NEXT_PUBLIC_STRIPE_PRODUCT_ID_BASIC;
export const productIdFamily = env.NEXT_PUBLIC_STRIPE_PRODUCT_ID_FAMILY;
export const productIdPremium = env.NEXT_PUBLIC_STRIPE_PRODUCT_ID_PREMIUM;
