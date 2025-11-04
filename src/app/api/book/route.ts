import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { type localesTitle } from "@/lib/navigation";

export const POST = async (req: NextRequest) => {
    const locale = (req.cookies.get("NEXT_LOCALE")?.value ||
        "en") as keyof typeof localesTitle;
    const t = await getTranslations({ locale });
    try {
        const body = await req.json();

        await db.book.create({
            data: body,
        });

        return NextResponse.json({
            success: true,
            message: t("messages.done"),
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};

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
                        name: true,
                    },
                },
                pages: {
                    select: {
                        image: true,
                        text: true,
                        color: true,
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

export const PUT = async (req: NextRequest) => {
    const locale = (req.cookies.get("NEXT_LOCALE")?.value ||
        "en") as keyof typeof localesTitle;
    const t = await getTranslations({ locale });
    try {
        const params = req.nextUrl.searchParams;
        const bookId = params.get("bookId");
        const body = await req.json();

        if (!bookId) {
            return NextResponse.json({
                success: false,
                message: t("messages.book-not-found"),
            });
        }

        const book = await db.book.update({
            where: {
                id: bookId,
            },
            data: body,
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
