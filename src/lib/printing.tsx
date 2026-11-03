import { getTranslations } from "next-intl/server";
import db, { type BookWithPages, type PrintOrder } from "@/lib/db";
import env from "@/lib/env";
import sendEmail from "@/lib/email";
import { putObject, readObject, getObject } from "@/lib/file";
import {
    createGelatoOrder,
    fromStripeShipping,
    gelatoDryRun,
    getCoverDimensions,
    type ShippingAddress,
} from "@/lib/gelato";
import { buildPrintPDF, innerPageCount, type PrintBook } from "@/lib/print";
import { stripe } from "@/lib/stripe";
import { formatAmountForDisplay, formatAmountForStripe } from "@/lib/utils";
import { bookUrl, notifyAdmin } from "@/lib/orders";
import NoticeEmail, { type NoticeKind } from "@/components/emails/notice";
import { price, printPrice } from "@/config/stripe";

/** The part of a hardcover order that is refunded if printing fails. */
export const printPart = () =>
    formatAmountForStripe(printPrice) - formatAmountForStripe(price);

export const printUrl = (bookId: string, orderId: string) =>
    `${env.APP_URL}/book/${bookId}/print?key=${orderId}`;

const toPrintBook = (b: BookWithPages): PrintBook => ({
    title: b.title,
    cover: b.cover,
    dedication: b.dedication,
    pages: b.pages.map(({ text, image, color, number }) => ({
        text,
        image,
        color,
        number,
    })),
});

/** Build the print PDF for a book (or a frozen snapshot of it). */
export const renderPrint = async (book: PrintBook, locale: string) => {
    const t = await getTranslations({ locale });
    const cover = await getCoverDimensions(innerPageCount(book.pages.length));
    const result = await buildPrintPDF({
        book,
        cover,
        loadImage: readObject,
        labels: {
            belongsTo: t("print.belongs-to"),
            theEnd: t("print.the-end"),
            madeWith: t("print.made-with"),
            backBlurb: t("print.back-blurb"),
        },
    });
    return { ...result, coverEstimated: cover.estimated };
};

export const notice = async (
    print: Pick<PrintOrder, "email" | "locale">,
    kind: NoticeKind,
    values: Record<string, string | number>,
    href?: string
) => {
    const t = await getTranslations({ locale: print.locale });
    await sendEmail(
        print.email,
        env.SENDER_EMAIL,
        t(`emails.${kind}.title`, values),
        t(`emails.${kind}.body`, values),
        <NoticeEmail t={t} kind={kind} values={values} href={href} />
    );
};

/**
 * A hardcover order's book is ready: open its print order and ask the
 * customer to check and confirm. Nothing is printed without that.
 */
export const openPrintOrder = async (orderId: string) => {
    const order = await db.orders.get(orderId);
    if (!order?.bookId || order.product !== "PRINT" || order.printId) return;
    const book = await db.books.get(order.bookId);
    if (!book) return;

    const print = await db.prints.create({
        orderId: order.id,
        bookId: order.bookId,
        email: order.email,
        locale: order.locale,
        amount: printPart(),
        shipping: order.shipping,
    });
    await notice(
        print,
        "print-confirm",
        { title: book.title },
        printUrl(book.id, order.id)
    );
};

/** Refund the print part of a hardcover order. */
const refundPrint = async (print: PrintOrder, reason: string) => {
    const order = await db.orders.get(print.orderId);
    const intent = order?.paymentIntentId;
    if (intent && !intent.startsWith("mock_")) {
        await stripe.refunds.create(
            {
                payment_intent: intent,
                amount: print.amount,
                reason: "requested_by_customer",
                metadata: { orderId: print.orderId, printId: print.id },
            },
            { idempotencyKey: `refund-print-${print.id}` }
        );
    } else {
        console.log(`[local] mock refund of print ${print.id}: ${reason}`);
    }
};

/**
 * The customer approved the book: freeze it, build the print file, send
 * the order to Gelato. Safe to call twice; only the first call proceeds.
 */
export const confirmPrint = async (
    printId: string,
    address: ShippingAddress
) => {
    const print = await db.prints.get(printId);
    if (!print) throw new Error("Print order not found");
    const book = await db.books.getWithPages(print.bookId);
    if (!book) throw new Error("Book not found");

    const snapshot = toPrintBook(book);
    const shipping = {
        name: address.name,
        address: {
            line1: address.line1,
            line2: address.line2 ?? null,
            postal_code: address.postalCode,
            city: address.city,
            country: "CH",
        },
    };
    const claimed = await db.prints.transition(
        printId,
        ["AWAITING_CONFIRMATION"],
        {
            status: "SUBMITTING",
            snapshot: { ...snapshot, dedication: snapshot.dedication ?? null },
            shipping,
            confirmedAt: new Date(),
        }
    );
    if (!claimed) return false;

    try {
        const { pdf, innerPages } = await renderPrint(snapshot, print.locale);
        const pdfKey = `${book.id}/print/${print.id}.pdf`;
        await putObject(pdf, pdfKey, "application/pdf");

        const gelato = await createGelatoOrder({
            printId: print.id,
            email: print.email,
            pdfUrl: getObject(pdfKey),
            innerPages,
            address,
        });

        await db.prints.update(print.id, {
            status: "SUBMITTED",
            pdfKey,
            innerPages,
            gelatoOrderId: gelato.id,
            error: null,
        });
        await notice(
            print,
            "print-printing",
            { title: book.title },
            bookUrl(book.id, print.orderId)
        );
        await notifyAdmin(`Print order sent: ${book.title}`, [
            gelatoDryRun ?
                "DRY RUN: no Gelato key, nothing was sent."
            :   `Gelato order ${gelato.id} (${env.GELATO_ORDER_TYPE}).`,
            env.GELATO_ORDER_TYPE === "draft" && !gelatoDryRun ?
                "It is a DRAFT: approve it in the Gelato dashboard to print."
            :   "",
            `Print file: ${getObject(pdfKey)}`,
            `Ship to: ${address.name}, ${address.line1}, ${address.postalCode} ${address.city}`,
        ]);
        return true;
    } catch (err) {
        const reason = String((err as Error)?.message ?? err).slice(0, 1000);
        console.error(`Print ${print.id} failed:`, err);
        await failPrint(print.id, reason);
        return false;
    }
};

/** Printing can't happen: refund the print part and tell everyone. */
export const failPrint = async (
    printId: string,
    reason: string,
    status: "FAILED" | "CANCELED" = "FAILED"
) => {
    const print = await db.prints.get(printId);
    if (!print || print.status === "FAILED" || print.status === "CANCELED") {
        return;
    }
    await refundPrint(print, reason);
    await db.prints.update(print.id, { status, error: reason });

    const book = await db.books.get(print.bookId);
    const amount = formatAmountForDisplay(print.amount / 100);
    await notice(
        print,
        status === "FAILED" ? "print-failed" : "print-canceled",
        { title: book?.title ?? "", amount }
    );
    await notifyAdmin(`Print ${status.toLowerCase()}: ${print.id}`, [
        `Refunded the print part (${amount}).`,
        `Reason: ${reason}`,
    ]);
};

/** Validate a Swiss address typed on the confirm page. */
export const parseAddress = (raw: unknown): ShippingAddress | null => {
    const a = (raw ?? {}) as Record<string, unknown>;
    const s = (k: string) => String(a[k] ?? "").trim();
    const address = {
        name: s("name"),
        line1: s("line1"),
        line2: s("line2") || null,
        postalCode: s("postalCode"),
        city: s("city"),
        country: "CH" as const,
    };
    if (
        !address.name ||
        !address.line1 ||
        !address.city ||
        !/^\d{4}$/.test(address.postalCode)
    ) {
        return null;
    }
    return address;
};

export const addressOf = (print: PrintOrder) =>
    fromStripeShipping(print.shipping as Record<string, unknown> | null);

/** Remind on day 3, 7 and 14; refund the print part after 60 days. */
export const REMINDER_DAYS = [3, 7, 14];
export const CONFIRM_DEADLINE_DAYS = 60;

export const sweepPrints = async () => {
    const summary = { reminded: 0, canceled: 0 };
    const day = 24 * 3600 * 1000;
    for (const p of await db.prints.byStatus(
        "AWAITING_CONFIRMATION",
        new Date(Date.now() + day)
    )) {
        const age = (Date.now() - p.createdAt.getTime()) / day;
        if (age >= CONFIRM_DEADLINE_DAYS) {
            await failPrint(p.id, "Not confirmed within 60 days", "CANCELED");
            summary.canceled++;
        } else if (
            p.remindersSent < REMINDER_DAYS.length &&
            age >= REMINDER_DAYS[p.remindersSent]
        ) {
            const book = await db.books.get(p.bookId);
            await notice(
                p,
                "print-reminder",
                { title: book?.title ?? "" },
                printUrl(p.bookId, p.orderId)
            );
            await db.prints.update(p.id, {
                remindersSent: p.remindersSent + 1,
            });
            summary.reminded++;
        }
    }
    return summary;
};

/** The print order of a book, if it was bought as a hardcover. */
export const printOfBook = async (bookId: string) => {
    const book = await db.books.get(bookId);
    const order = book?.orderId ? await db.orders.get(book.orderId) : null;
    return order?.printId ? db.prints.get(order.printId) : null;
};

/**
 * Apply a Gelato order update (webhook, or the local simulator).
 * `fulfillmentStatus` follows Gelato: created, passed, in_production,
 * printed, shipped, delivered, canceled, failed…
 */
export const applyGelatoUpdate = async (u: {
    printId: string;
    fulfillmentStatus?: string | null;
    trackingUrl?: string | null;
}) => {
    const print = await db.prints.get(u.printId);
    if (!print) return { ignored: "unknown print" };
    const status = (u.fulfillmentStatus ?? "").toLowerCase();

    if (u.trackingUrl && u.trackingUrl !== print.trackingUrl) {
        await db.prints.update(print.id, { trackingUrl: u.trackingUrl });
    }

    const after: PrintOrder["status"][] = ["SUBMITTED", "IN_PRODUCTION"];
    if (["in_production", "printed", "passed"].includes(status)) {
        await db.prints.transition(print.id, ["SUBMITTED"], {
            status: "IN_PRODUCTION",
        });
    } else if (status === "shipped") {
        const moved = await db.prints.transition(print.id, after, {
            status: "SHIPPED",
            shippedAt: new Date(),
        });
        if (moved) {
            const book = await db.books.get(print.bookId);
            const tracking = u.trackingUrl ?? print.trackingUrl;
            await notice(
                print,
                "print-shipped",
                { title: book?.title ?? "" },
                tracking ?? bookUrl(print.bookId, print.orderId)
            );
        }
    } else if (status === "delivered") {
        await db.prints.transition(print.id, [...after, "SHIPPED"], {
            status: "DELIVERED",
            deliveredAt: new Date(),
        });
    } else if (status === "canceled" || status === "failed") {
        await failPrint(print.id, `Gelato: ${status}`);
    }
    return { ok: true };
};
