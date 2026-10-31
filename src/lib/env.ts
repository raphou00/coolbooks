import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export default createEnv({
    skipValidation: false,
    server: {
        NODE_ENV: z
            .enum(["development", "preview", "production"])
            .default("development"),

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

        /** Main data table (users, sessions, books, orders…). */
        DATA_DYNAMODB_TABLE: z
            .string()
            .min(1, { message: "Data DynamoDB table is missing" }),

        /** Local development only: DynamoDB Local, e.g. http://localhost:8001 */
        DYNAMODB_ENDPOINT: z.string().url().optional(),

        BUCKET_NAME: z.string().min(1, { message: "Bucket name is missing" }),

        CLOUDFRONT_URL: z
            .string()
            .min(1, { message: "Cloudfront URL is missing" }),

        BOOK_CREATOR_LAMBDA_ARN: z
            .string()
            .min(1, { message: "Book creator lambda ARN is missing" }),

        RATE_LIMITS_DYNAMODB_TABLE: z
            .string()
            .min(1, { message: "Rate limits DynamoDB table is missing" }),

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

        GOOGLE_CLIENT_ID: z
            .string()
            .min(1, { message: "Google Client ID is missing" }),

        GOOGLE_CLIENT_SECRET: z
            .string()
            .min(1, { message: "Google Client Secret is missing" }),

        /** Moderation of story ideas and read-aloud audio (text-to-speech). */
        OPENAI_API_KEY: z
            .string()
            .min(1, { message: "OpenAI API key is missing" }),

        /** Shared with the book-creator Lambda; signs its delivery callback. */
        LAMBDA_CALLBACK_SECRET: z.string().min(32, {
            message: "Lambda callback secret must be at least 32 characters",
        }),

        /** Sent by the scheduler to /api/cron/* as `Authorization: Bearer …`. */
        CRON_SECRET: z
            .string()
            .min(16, { message: "Cron secret must be at least 16 characters" }),

        /** Receives failed-order alerts and print orders. Defaults to SENDER_EMAIL. */
        ADMIN_EMAIL: z.string().email().optional(),
    },
    client: {
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
            .string()
            .min(1, { message: "Stripe Publishable Key is missing" }),

        NEXT_PUBLIC_CLOUDFRONT_URL: z
            .string()
            .min(1, { message: "Cloudinary URL is missing" }),
    },
    runtimeEnv: {
        NODE_ENV: process.env.VERCEL_ENV,
        APP_URL: process.env.APP_URL,
        AWS_REGION: process.env.AWS_REGION,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        DATA_DYNAMODB_TABLE: process.env.DATA_DYNAMODB_TABLE,
        DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT || undefined,
        BUCKET_NAME: process.env.BUCKET_NAME,
        CLOUDFRONT_URL: process.env.CLOUDFRONT_URL,
        NEXT_PUBLIC_CLOUDFRONT_URL: process.env.NEXT_PUBLIC_CLOUDFRONT_URL,
        BOOK_CREATOR_LAMBDA_ARN: process.env.BOOK_CREATOR_LAMBDA_ARN,
        RATE_LIMITS_DYNAMODB_TABLE: process.env.RATE_LIMITS_DYNAMODB_TABLE,
        RESEND_API_KEY: process.env.RESEND_API_KEY,
        SENDER_EMAIL: process.env.SENDER_EMAIL,
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
            process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        LAMBDA_CALLBACK_SECRET: process.env.LAMBDA_CALLBACK_SECRET,
        CRON_SECRET: process.env.CRON_SECRET,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL || undefined,
    },
});
