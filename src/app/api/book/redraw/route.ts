import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import env from "@/lib/env";
import { canEditBook, isBookLocked, refreshEmailedPDF } from "@/lib/books";
import { invokeCreator } from "@/lib/orders";
import { checkRateLimit, ratelimitRedraw } from "@/lib/rate-limiter";
import { maxRedraws } from "@/config/stripe";
import { isOverBudget } from "@/lib/budget";

export const maxDuration = 120;

/** Free redraw of one page ("you'll love it or we redo it"). */
export const POST = async (req: NextRequest) => {
    const locale = req.cookies.get("NEXT_LOCALE")?.value || "de";
    const t = await getTranslations({ locale });

    try {
        const { bookId, pageId, key } = (await req.json()) as {
            bookId?: string;
            pageId?: string;
            key?: string;
        };
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            "unknown";

        const { allowed } = await checkRateLimit(
            `redraw:${ip}`,
            ratelimitRedraw
        );
        if (!allowed) {
            return NextResponse.json({
                success: false,
                message: t("messages.too-many-requests"),
            });
        }

        const page =
            bookId && pageId ? await db.books.getPage(bookId, pageId) : null;
        if (
            !page ||
            !(await canEditBook(page.bookId, key)) ||
            (await isBookLocked(page.bookId))
        ) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        if (await isOverBudget()) {
            return NextResponse.json({
                success: false,
                message: t("messages.preview-paused"),
            });
        }

        // Reserve a redraw first so parallel clicks can't exceed the limit.
        if (!(await db.books.reserveRedraw(page.bookId, maxRedraws))) {
            return NextResponse.json({
                success: false,
                message: t("messages.redraw-limit", { max: maxRedraws }),
            });
        }

        let image: string;
        try {
            const result = await invokeCreator<{ image: string }>({
                mode: "redraw",
                bookId: page.bookId,
                pageId: page.id,
            });
            if (!result?.image) throw new Error("No image returned");
            image = result.image;
        } catch (err) {
            await db.books.releaseRedraw(page.bookId);
            throw err;
        }

        // Refresh the emailed PDF so its link has the new page too.
        await refreshEmailedPDF(page.bookId, locale).catch((e) =>
            console.error("PDF refresh failed", e)
        );
        const book = await db.books.get(page.bookId);

        return NextResponse.json({
            success: true,
            image: `${env.CLOUDFRONT_URL}/${image}`,
            key: image,
            remaining: maxRedraws - (book?.redraws ?? maxRedraws),
        });
    } catch (err) {
        console.error("Redraw failed:", err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
