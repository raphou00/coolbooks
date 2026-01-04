import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { type localesTitle } from "@/lib/navigation";
import { deleteObject } from "@/lib/file";
import { getUser } from "@/lib/auth";

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
                age: true,
                artStyle: true,
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

        const book = await db.book.findUnique({
            where: {
                id: bookId,
            },
            select: {
                id: true,
                user: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!book) {
            return NextResponse.json({
                success: false,
                message: t("messages.book-not-found"),
            });
        }

        await db.book.delete({
            where: {
                id: book.id,
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
