import env from "@/lib/env";

export const currency = "USD" as const;
export const productId = env.NEXT_PUBLIC_STRIPE_PRODUCT_ID;
