import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export default createEnv({
    skipValidation: !!process.env.SKIP_ENV_VALIDATION,
    server: {
        NODE_ENV: z
            .enum(["development", "preview", "production"])
            .default("development"),

        CRON_SECRET: z.string().min(1, { message: "Cron Secret is missing" }),

        APP_URL: z
            .string()
            .url({ message: "App URL is invalid" })
            .min(1, { message: "App URL is missing" }),

        AWS_REGION: z.string().min(1, { message: "AWS Region is missing" }),

        AWS_ACCESS_KEY_ID: z
            .string()
            .min(1, { message: "AWS Access Key ID is missing" }),

        AWS_SECRET_ACCESS_KEY: z
            .string()
            .min(1, { message: "AWS Secret Access Key is missing" }),

        DATABASE_URL: z.string().min(1, { message: "Database URL is missing" }),

        BUCKET_NAME: z.string().min(1, { message: "Bucket name is missing" }),

        CLOUDFRONT_URL: z
            .string()
            .min(1, { message: "Cloudfront URL is missing" }),

        WEBSOCKET_URL: z
            .string()
            .min(1, { message: "Websocket URL is missing" }),

        DYNAMO_TABLE: z
            .string()
            .min(1, { message: "Dynamodb Table is missing" }),

        UPSTASH_REDIS_REST_URL: z
            .string()
            .min(1, { message: "Upstash Redis REST URL is missing" }),

        UPSTASH_REDIS_REST_TOKEN: z
            .string()
            .min(1, { message: "Upstash Redis REST Token is missing" }),

        RESEND_API_KEY: z
            .string()
            .min(1, { message: "Resend API key is missing" }),

        SENDER_EMAIL: z.string().min(1, { message: "Sender Email is missing" }),

        STRIPE_SECRET_KEY: z
            .string()
            .min(1, { message: "Stripe Secret Key is missing" }),

        STRIPE_WEBHOOK_SECRET: z
            .string()
            .min(1, { message: "Stripe Webhook Secret is missing" }),
        
        STRIPE_PRODUCT_ID: z
            .string()
            .min(1, { message: "Stripe Product ID is missing" }),

        GOOGLE_CLIENT_ID: z
            .string()
            .min(1, { message: "Google Client ID is missing" }),

        GOOGLE_CLIENT_SECRET: z
            .string()
            .min(1, { message: "Google Client Secret is missing" }),

        DISCORD_CLIENT_ID: z
            .string()
            .min(1, { message: "Discord Client ID is missing" }),

        DISCORD_CLIENT_SECRET: z
            .string()
            .min(1, { message: "Discord Client Secret is missing" }),
    },
    client: {
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
            .string()
            .min(1, { message: "Stripe Publishable Key is missing" }),

        NEXT_PUBLIC_CLOUDFRONT_URL: z
            .string()
            .min(1, { message: "Cloudinary URL is missing" }),

        NEXT_PUBLIC_WEBSOCKET_URL: z
            .string()
            .min(1, { message: "Websocket URL is missing" }),
    },
    runtimeEnv: {
        NODE_ENV: process.env.VERCEL_ENV,
        CRON_SECRET: process.env.CRON_SECRET,
        APP_URL: process.env.APP_URL,
        AWS_REGION: process.env.AWS_REGION,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        DATABASE_URL: process.env.DATABASE_URL,
        BUCKET_NAME: process.env.BUCKET_NAME,
        CLOUDFRONT_URL: process.env.CLOUDFRONT_URL,
        NEXT_PUBLIC_CLOUDFRONT_URL: process.env.NEXT_PUBLIC_CLOUDFRONT_URL,
        WEBSOCKET_URL: process.env.WEBSOCKET_URL + "$default",
        NEXT_PUBLIC_WEBSOCKET_URL:
            process.env.NEXT_PUBLIC_WEBSOCKET_URL + "$default",
        DYNAMO_TABLE: process.env.DYNAMO_TABLE,
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        SENDER_EMAIL: process.env.SENDER_EMAIL,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        STRIPE_PRODUCT_ID: process.env.STRIPE_PRODUCT_ID,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    },
});
