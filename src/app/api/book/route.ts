import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { type localesTitle } from "@/lib/navigation";
import { deleteObject } from "@/lib/file";
import { getUser } from "@/lib/auth";
import { canEditBook } from "@/lib/books";

export const GET = async (req: NextRequest) => {
    const locale = (req.cookies.get("NEXT_LOCALE")?.value ||
        "en") as keyof typeof localesTitle;
    const t = await getTranslations({ locale });
    try {
        const params = req.nextUrl.searchParams;
        const bookId = params.get("bookId");

        if (!bookId) {
            return NextResponse.json({
                success: false,
                message: t("messages.book-not-found"),
            });
        }

        const book = await db.books.getWithPages(bookId);

        return NextResponse.json({
            success: true,
            message: t("messages.done"),
            book,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};

export const DELETE = async (req: NextRequest) => {
    const locale = (req.cookies.get("NEXT_LOCALE")?.value ||
        "en") as keyof typeof localesTitle;
    const t = await getTranslations({ locale });
    try {
        const params = req.nextUrl.searchParams;
        const bookId = params.get("bookId");

        const user = await getUser();

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        if (!bookId) {
            return NextResponse.json({
                success: false,
                message: t("messages.book-not-found"),
            });
        }

        const book = await db.books.get(bookId);

        if (!book) {
            return NextResponse.json({
                success: false,
                message: t("messages.book-not-found"),
            });
        }

        // Only the owner (or an admin) may delete a book.
        if (!(await canEditBook(book.id))) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        await db.books.delete(book.id);

        await deleteObject(book.id);

        return NextResponse.json({
            success: true,
            message: t("messages.book-deleted"),
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
