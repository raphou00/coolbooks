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
        const { session, user } = (await req.json()) as {
            session: Stripe.Checkout.Session;
            user: User | null;
        };

        const t = await getTranslations({ locale: user?.locale || "en" });

        const result = (await req.json()) as Book;

        const blob = await exportPDF(result);
        const key = result.bookId + "/" + result.bookId + ".pdf";
        await putObject(blob, key);

        const email = session.metadata!.email!;
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
