import { timingSafeEqual } from "node:crypto";
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import env from "@/lib/env";
import sendEmail from "@/lib/email";
import { putObject } from "@/lib/file";
import { exportPDF } from "@/lib/export";
import { stripe } from "@/lib/stripe";
import { formatAmountForDisplay } from "@/lib/utils";
import BookEmail from "@/components/emails/book";
import { isLocal } from "@/lib/local";

const lambda = new LambdaClient();

type CreatorEvent =
    | { mode: "preview"; previewId: string }
    | { mode: "redraw"; bookId: string; pageId: string }
    | { mode: "book"; orderId: string; appUrl: string };

/**
 * Call the book-creator Lambda. Preview and redraw wait for the result;
 * a full book runs in the background and reports back via the callback.
 */
export const invokeCreator = async <R = unknown,>(
    event: CreatorEvent
): Promise<R | null> => {
    if (isLocal) {
        const { invokeLocalCreator } = await import("@/lib/local/creator");
        return (await invokeLocalCreator(event)) as R | null;
    }

    const wait = event.mode !== "book";
    const res = await lambda.send(
        new InvokeCommand({
            FunctionName: env.BOOK_CREATOR_LAMBDA_ARN,
            InvocationType: wait ? "RequestResponse" : "Event",
            Payload: Buffer.from(JSON.stringify(event)),
        })
    );

    if (!wait) return null;

    const payload =
        res.Payload ? JSON.parse(Buffer.from(res.Payload).toString()) : null;
    if (res.FunctionError) {
        throw new Error(
            `Book creator failed (${event.mode}): ${payload?.errorMessage ?? res.FunctionError}`
        );
    }
    return payload as R;
};

/** Start (or retry) generation of a paid order. */
export const startGeneration = async (orderId: string) => {
    await invokeCreator({
        mode: "book",
        orderId,
        appUrl: `${env.APP_URL}/api/stripe/process-checkout`,
    });
};

/**
 * Mark an order paid and start its book, exactly once. Stripe can deliver
 * the same event several times; only the first PENDING → PAID flip wins.
 */
export const markOrderPaid = async (
    orderId: string,
    payment: {
        stripeSessionId: string;
        paymentIntentId: string | null;
        shipping: Record<string, unknown> | null;
    }
) => {
    const updated = await db.orders.transition(orderId, ["PENDING"], {
        status: "PAID",
        paidAt: new Date(),
        ...payment,
    });
    if (!updated) return; // already handled

    try {
        await startGeneration(orderId);
    } catch (err) {
        // The order stays PAID; the order sweeper will start it again.
        console.error(`Could not start book for order ${orderId}`, err);
    }
};

/** Constant-time check of the Lambda's callback secret. */
export const isValidCallback = (header: string | null) => {
    if (!header) return false;
    const a = Buffer.from(header);
    const b = Buffer.from(env.LAMBDA_CALLBACK_SECRET);
    return a.length === b.length && timingSafeEqual(a, b);
};

export const adminEmail = () => env.ADMIN_EMAIL ?? env.SENDER_EMAIL;

/** Plain alert to the shop owner (English, not customer-facing). */
export const notifyAdmin = async (subject: string, lines: string[]) => {
    const text = lines.join("\n");
    await sendEmail(
        adminEmail(),
        env.SENDER_EMAIL,
        `[Bibliboo] ${subject}`,
        text,
        <pre style={{ fontFamily: "monospace", fontSize: 13 }}>{text}</pre>
    );
};

/** Private link to a book: the order id acts as the access key. */
export const bookUrl = (bookId: string, orderId: string) =>
    `${env.APP_URL}/book/${bookId}?key=${orderId}`;

/**
 * Build the PDF and email it. Called once the Lambda has finished the book.
 * Idempotent: a delivered order is never emailed twice.
 */
export const deliverOrder = async (orderId: string) => {
    const order = await db.orders.get(orderId);
    if (!order?.bookId) throw new Error(`Order ${orderId} has no book`);
    if (order.status === "DELIVERED") return;

    const book = await db.books.getWithPages(order.bookId);
    if (!book) throw new Error(`Book ${order.bookId} not found`);
    const t = await getTranslations({ locale: order.locale });

    const blob = await exportPDF({
        bookId: book.id,
        email: order.email,
        locale: order.locale,
        title: book.title,
        cover: book.cover,
        dedication: book.dedication,
        pages: book.pages,
    });
    const key = `${book.id}/${book.id}.pdf`;
    await putObject(blob, key);
    const pdf = `${env.CLOUDFRONT_URL}/${key}`;
    const link = bookUrl(book.id, order.id);

    if (order.giftTo) {
        await sendEmail(
            order.giftTo,
            env.SENDER_EMAIL,
            t("emails.gift.title", { from: order.giftFrom ?? "" }),
            t("emails.gift.body", {
                from: order.giftFrom ?? "",
                title: book.title,
            }),
            <BookEmail
                t={t}
                kind="gift"
                title={book.title}
                pdf={pdf}
                bookUrl={`${env.APP_URL}/book/${book.id}`}
                giftFrom={order.giftFrom ?? ""}
            />
        );
    }

    const kind = order.giftTo ? "gift-sent" : "receipt";
    await sendEmail(
        order.email,
        env.SENDER_EMAIL,
        t(`emails.${kind}.title`, { title: book.title }),
        t(`emails.${kind}.body`, {
            title: book.title,
            to: order.giftTo ?? "",
        }),
        <BookEmail
            t={t}
            kind={kind}
            title={book.title}
            pdf={pdf}
            bookUrl={link}
            giftTo={order.giftTo ?? ""}
        />
    );

    await db.orders.update(order.id, {
        status: "DELIVERED",
        deliveredAt: new Date(),
        error: null,
    });

    if (order.product === "PRINT") {
        // Ask the customer to check and confirm before anything is printed.
        const { openPrintOrder } = await import("@/lib/printing");
        await openPrintOrder(order.id);
    }
};

/** Refund a paid order that could not be produced, and tell everyone. */
export const refundOrder = async (orderId: string, reason: string) => {
    const order = await db.orders.get(orderId);
    if (!order || order.status === "REFUNDED" || !order.paymentIntentId) {
        return;
    }

    if (order.paymentIntentId.startsWith("mock_")) {
        console.log(`[local] mock refund of order ${order.id}`);
    } else {
        await stripe.refunds.create(
            {
                payment_intent: order.paymentIntentId,
                reason: "requested_by_customer",
                metadata: { orderId: order.id },
            },
            { idempotencyKey: `refund-${order.id}` }
        );
    }

    await db.orders.update(order.id, {
        status: "REFUNDED",
        error: reason.slice(0, 1000),
    });

    const t = await getTranslations({ locale: order.locale });
    const amount = formatAmountForDisplay(order.amount / 100);
    await sendEmail(
        order.email,
        env.SENDER_EMAIL,
        t("emails.refund.title"),
        t("emails.refund.body", { amount }),
        <BookEmail t={t} kind="refund" title="" amount={amount} />
    );

    await notifyAdmin(`Refunded order ${order.id}`, [
        `The book could not be generated after ${order.attempts} attempts and was refunded automatically.`,
        ``,
        `Buyer: ${order.email}`,
        `Amount: ${amount}`,
        `Last error: ${reason}`,
    ]);
};
