import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { type localesTitle } from "@/lib/navigation";
import { deleteObject } from "@/lib/file";

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

        const book = await db.book.findUnique({
            where: {
                id: bookId,
            },
            select: {
                id: true,
                title: true,
                cover: true,
                public: true,
                themes: true,
                age: true,
                generating: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                pages: {
                    select: {
                        id: true,
                        image: true,
                        text: true,
                        color: true,
                        number: true,
                    },
                },
                updatedAt: true,
            },
        });

        if (!book) {
            return NextResponse.json({
                success: false,
                message: t("messages.book-not-found"),
            });
        }

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

        if (!bookId) {
            return NextResponse.json({
                success: false,
                message: t("messages.book-not-found"),
            });
        }

        const book = await db.book.delete({
            where: {
                id: bookId,
            },
        });

        await deleteObject("/" + book.id);

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
