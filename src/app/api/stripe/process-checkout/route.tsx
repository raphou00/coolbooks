import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getTranslations } from "next-intl/server";
import type { User } from "@/lib/types";
import env from "@/lib/env";
import { putObject } from "@/lib/file";
import sendEmail from "@/lib/email";
import { exportPDF, type Book } from "@/lib/export";
import Receipt from "@/components/emails/receipt";

export const POST = async (req: NextRequest) => {
    try {
        const result = (await req.json()) as Book;

        const t = await getTranslations({ locale: "en" });

        const blob = await exportPDF(result);
        const key = result.bookId + "/" + result.bookId + ".pdf";
        await putObject(blob, key);

        const email = result.email;
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
