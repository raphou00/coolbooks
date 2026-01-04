import { getTranslations } from "next-intl/server";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import Stripe from "stripe";
import type { User } from "@/lib/types";
import { title } from "@/config/seo";
import env from "./env";
import sendEmail from "./email";
import { putObject } from "./file";
import { exportPDF, type Book } from "./export";
import Receipt from "@/components/emails/receipt";

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
        const t = await getTranslations({ locale: user?.locale || "en" });

        const command = new InvokeCommand({
            FunctionName: env.BOOK_CREATOR_LAMBDA_ARN,
            InvocationType: "RequestResponse",
            Payload: Buffer.from(
                JSON.stringify({ userId: user?.id, topic: session.metadata })
            ),
        });

        const response = await client.send(command);
        const payload = JSON.parse(new TextDecoder().decode(response.Payload));
        const result = JSON.parse(payload.body) as Book;

        const blob = await exportPDF(result);
        const key =
            (result as unknown as { bookId: string }).bookId +
            "/" +
            crypto.randomUUID() +
            ".pdf";
        await putObject(blob, key);

        const email = user ? user.email : session.customer_email!;
        await sendEmail(
            email,
            env.SENDER_EMAIL,
            t("emails.receipt.title"),
            t("emails.receipt.body", { title: result.title }),
            <Receipt
                t={t}
                name={email}
                title={result.title}
                pdf={env.CLOUDFRONT_URL + "/" + key}
            />
        );
    } catch (err) {
        console.error(err);
    }
};
