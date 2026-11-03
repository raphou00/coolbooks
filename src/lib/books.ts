import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { exportPDF } from "@/lib/export";
import { putObject } from "@/lib/file";

/**
 * Who may change a book (delete, redraw pages): its owner's account, or
 * whoever holds the private link from the purchase email (?key=<orderId>).
 */
export const canEditBook = async (bookId: string, key?: string | null) => {
    const book = await db.books.get(bookId);
    if (!book) return false;

    if (key && book.orderId && book.orderId === key) return true;

    const user = await getUser();
    if (!user?.user) return false;
    return user.user.role === "ADMIN" || book.userId === user.user.id;
};

/**
 * A book is locked once its print order is confirmed: what was approved
 * is what gets printed, so no more edits or redraws.
 */
export const isBookLocked = async (bookId: string) => {
    const book = await db.books.get(bookId);
    const order = book?.orderId ? await db.orders.get(book.orderId) : null;
    if (!order?.printId) return false;
    const print = await db.prints.get(order.printId);
    return !!print && print.status !== "AWAITING_CONFIRMATION";
};

/** Rebuild the emailed PDF after an edit, so its link shows the changes. */
export const refreshEmailedPDF = async (bookId: string, locale: string) => {
    const book = await db.books.getWithPages(bookId);
    if (!book) return;
    const order = book.orderId ? await db.orders.get(book.orderId) : null;
    const blob = await exportPDF({
        bookId: book.id,
        email: order?.email ?? "",
        locale,
        title: book.title,
        cover: book.cover,
        dedication: book.dedication,
        pages: book.pages,
    });
    await putObject(blob, `${book.id}/${book.id}.pdf`);
};
