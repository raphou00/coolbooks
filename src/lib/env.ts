import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/**
 * LOCAL_MODE=true runs the whole shop on one machine: DynamoDB Local, files
 * on disk, the book generator in-process, emails in a local inbox. Cloud
 * keys (AWS, Resend, Google, Stripe, AI) then become optional.
 */
const local = process.env.LOCAL_MODE === "true";

/** In local mode only, fall back to a development value. */
const orLocal = (schema: z.ZodString, fallback: string) =>
    local ? schema.default(fallback) : schema;

/** A required string, or an optional one in local mode. */
const need = (message: string) =>
    local ? z.string().default("") : z.string().min(1, { message });

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

        LOCAL_MODE: z
            .enum(["true", "false"])
            .default("false")
            .transform((v) => v === "true"),

        /**
         * mock: canned story + placeholder images, no AI cost (local default).
         * real: OpenRouter planner + image model.
         */
        AI_MODE: z.enum(["mock", "real"]).default(local ? "mock" : "real"),

        /** mock: a local "pay" page instead of Stripe (local mode only). */
        PAYMENTS: z.enum(["mock", "stripe"]).default("stripe"),

        /**
         * Monthly AI spend cap in USD. Once reached, free cover previews and
         * redraws stop (paid books still finish) and the admin is emailed.
         */
        AI_MONTHLY_BUDGET_USD: z.coerce.number().positive().default(50),

        /** Days after delivery before the review email (0 to test locally). */
        REVIEW_DELAY_DAYS: z.coerce.number().min(0).default(7),

        /** Gelato print API. Without a key, print orders are a dry run. */
        GELATO_API_KEY: z.string().optional(),
        /**
         * draft: orders appear in the Gelato dashboard but are not printed
         * until you approve them there (default). order: printed right away.
         */
        GELATO_ORDER_TYPE: z.enum(["draft", "order"]).default("draft"),
        GELATO_PRODUCT_UID: z
            .string()
            .default(
                "photobooks-hardcover_pf_200x200-mm-8x8-inch_pt_170-gsm-65lb-coated-silk_cl_4-4_ccl_4-4_bt_glued-left_ct_matt-lamination_prt_1-0_cpt_130-gsm-65-lb-cover-coated-silk_ver"
            ),
        /** Shared secret in the Gelato webhook URL (?secret=…). */
        GELATO_WEBHOOK_SECRET: z.string().optional(),

        /** OpenRouter key; only read by the in-process generator in local mode. */
        OPENROUTER_API_KEY: z.string().optional(),

        AWS_REGION: z.string().min(1, { message: "AWS Region is missing" }),

        AWS_ACCESS_KEY_ID: need("AWS Access Key ID is missing"),

        AWS_SECRET_ACCESS_KEY: need("AWS Secret Access Key is missing"),

        /** Main data table (users, sessions, books, orders…). */
        DATA_DYNAMODB_TABLE: z
            .string()
            .min(1, { message: "Data DynamoDB table is missing" }),

        /** Local development only: DynamoDB Local, e.g. http://localhost:8001 */
        DYNAMODB_ENDPOINT: z.string().url().optional(),

        BUCKET_NAME: need("Bucket name is missing"),

        CLOUDFRONT_URL: need("Cloudfront URL is missing"),

        BOOK_CREATOR_LAMBDA_ARN: need("Book creator lambda ARN is missing"),

        RATE_LIMITS_DYNAMODB_TABLE: z
            .string()
            .min(1, { message: "Rate limits DynamoDB table is missing" }),

        RESEND_API_KEY: need("Resend API key is missing"),

        SENDER_EMAIL: orLocal(
            z.string().min(1, { message: "Sender Email is missing" }),
            "hello@bibliboo.local"
        ),

        STRIPE_SECRET_KEY: need("Stripe Secret Key is missing"),

        STRIPE_WEBHOOK_SECRET: need("Stripe Webhook Secret is missing"),

        GOOGLE_CLIENT_ID: need("Google Client ID is missing"),

        GOOGLE_CLIENT_SECRET: need("Google Client Secret is missing"),

        /** Moderation of story ideas and read-aloud audio (text-to-speech). */
        OPENAI_API_KEY: need("OpenAI API key is missing"),

        /** Shared with the book-creator Lambda; signs its delivery callback. */
        LAMBDA_CALLBACK_SECRET: orLocal(
            z.string().min(32, {
                message:
                    "Lambda callback secret must be at least 32 characters",
            }),
            "local-callback-secret-0000000000"
        ),

        /** Sent by the scheduler to /api/cron/* as `Authorization: Bearer …`. */
        CRON_SECRET: orLocal(
            z.string().min(16, {
                message: "Cron secret must be at least 16 characters",
            }),
            "local-cron-secret"
        ),

        /** Receives failed-order alerts and print orders. Defaults to SENDER_EMAIL. */
        ADMIN_EMAIL: z.string().email().optional(),
    },
    client: {
        /** Only needed for embedded Stripe Elements (Checkout redirects need none). */
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),

        NEXT_PUBLIC_CLOUDFRONT_URL: z
            .string()
            .min(1, { message: "CloudFront URL is missing" }),
    },
    runtimeEnv: {
        NODE_ENV: process.env.VERCEL_ENV,
        APP_URL: process.env.APP_URL,
        LOCAL_MODE: process.env.LOCAL_MODE || undefined,
        AI_MODE: process.env.AI_MODE || undefined,
        PAYMENTS: process.env.PAYMENTS || undefined,
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || undefined,
        AI_MONTHLY_BUDGET_USD: process.env.AI_MONTHLY_BUDGET_USD || undefined,
        GELATO_API_KEY: process.env.GELATO_API_KEY || undefined,
        REVIEW_DELAY_DAYS: process.env.REVIEW_DELAY_DAYS || undefined,
        GELATO_ORDER_TYPE: process.env.GELATO_ORDER_TYPE || undefined,
        GELATO_PRODUCT_UID: process.env.GELATO_PRODUCT_UID || undefined,
        GELATO_WEBHOOK_SECRET: process.env.GELATO_WEBHOOK_SECRET || undefined,
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
