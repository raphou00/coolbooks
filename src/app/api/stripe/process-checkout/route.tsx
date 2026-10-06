import { timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import env from "@/lib/env";
import { deleteObject, putObject } from "@/lib/file";
import sendEmail from "@/lib/email";
import { stripe } from "@/lib/stripe";
import { exportPDF, type Book } from "@/lib/export";
import Receipt from "@/components/emails/receipt";
import Refund from "@/components/emails/refund";

type FailedBook = {
    status: "failed";
    bookId: string;
    paymentIntent: string | null;
    email: string;
    locale: string;
};

type ProcessCheckoutBody = (Book & { status: "done" }) | FailedBook;

// Only the book-creator Lambda may call this route.
const isAuthorized = (req: NextRequest) => {
    const header = req.headers.get("authorization") ?? "";
    const expected = Buffer.from(`Bearer ${env.BOOK_CREATOR_SECRET}`);
    const received = Buffer.from(header);

    return (
        received.length === expected.length &&
        timingSafeEqual(received, expected)
    );
};

const handleFailed = async (result: FailedBook) => {
    const t = await getTranslations({ locale: result.locale });

    // Refund first: cleanup failing must never cost the customer their money.
    if (!result.paymentIntent) {
        throw new Error(`No payment intent to refund for ${result.bookId}`);
    }

    await stripe.refunds.create(
        { payment_intent: result.paymentIntent },
        { idempotencyKey: `refund-${result.bookId}` }
    );

    await sendEmail(
        result.email,
        env.SENDER_EMAIL,
        t("emails.refund.title"),
        t("emails.refund.body"),
        <Refund t={t} />
    );

    try {
        await deleteObject(result.bookId);
    } catch (err) {
        console.error(`Could not clean up images for ${result.bookId}`, err);
    }
};

const handleDone = async (result: Book) => {
    const t = await getTranslations({ locale: result.locale });

    const blob = await exportPDF(result);
    const key = result.bookId + "/" + result.bookId + ".pdf";
    await putObject(blob, key);

    await sendEmail(
        result.email,
        env.SENDER_EMAIL,
        t("emails.receipt.title", { title: result.title }),
        t("emails.receipt.body", { title: result.title }),
        <Receipt
            t={t}
            title={result.title}
            pdf={env.CLOUDFRONT_URL + "/" + key}
        />
    );
};

export const POST = async (req: NextRequest) => {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = (await req.json()) as ProcessCheckoutBody;

        if (result.status === "failed") {
            await handleFailed(result);
        } else {
            await handleDone(result);
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Process checkout error:", err);
        return NextResponse.json(
            { error: "Processing failed" },
            { status: 500 }
        );
    }
};
