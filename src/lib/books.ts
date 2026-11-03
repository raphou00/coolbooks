import db from "@/lib/db";
import { getUser } from "@/lib/auth";

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
