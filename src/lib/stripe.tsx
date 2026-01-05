import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import Stripe from "stripe";
import type { User } from "@/lib/types";
import { title } from "@/config/seo";
import env from "./env";

const client = new LambdaClient();

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-10-29.clover",
    appInfo: {
        name: title,
        url: env.APP_URL,
    },
});

export const handleCheckout = async (
    session: Stripe.Checkout.Session,
    user: User | null
) => {
    try {
        const command = new InvokeCommand({
            FunctionName: env.BOOK_CREATOR_LAMBDA_ARN,
            InvocationType: "Event",
            Payload: Buffer.from(
                JSON.stringify({
                    appUrl: env.APP_URL + "/api/stripe/process-checkout",
                    userId: user?.id,
                    topic: session.metadata,
                })
            ),
        });

        await client.send(command);
    } catch (err) {
        console.error(err);
        throw err;
    }
};
