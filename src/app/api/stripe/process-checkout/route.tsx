import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import type { User } from "@/lib/types";
import { getTranslations } from "next-intl/server";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import env from "@/lib/env";
import { exportPDF, type Book } from "@/lib/export";
import { putObject } from "@/lib/file";
import sendEmail from "@/lib/email";
import Receipt from "@/components/emails/receipt";

const client = new LambdaClient();

export const POST = async (req: NextRequest) => {
    try {
        const { session, user } = (await req.json()) as {
            session: Stripe.Checkout.Session;
            user: User | null;
        };

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

        const email = user ? user.email : session.metadata!.email!;
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

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Process checkout error:", err);
        return NextResponse.json(
            { error: "Processing failed" },
            { status: 500 }
        );
    }
};
