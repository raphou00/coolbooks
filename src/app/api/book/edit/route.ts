import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import db from "@/lib/db";
import { canEditBook, isBookLocked, refreshEmailedPDF } from "@/lib/books";
import { checkRateLimit, ratelimitPost } from "@/lib/rate-limiter";
import { maxDedicationLength } from "@/schema/book";
import { maxPageTextLength, maxTitleLength } from "@/config/char";

export const maxDuration = 120;

const schema = z.object({
    bookId: z.string().uuid(),
    key: z.string().nullish(),
    title: z.string().trim().min(1).max(maxTitleLength),
    dedication: z.string().trim().max(maxDedicationLength),
    pages: z
        .array(
            z.object({
                id: z.string().uuid(),
                text: z.string().trim().min(1).max(maxPageTextLength),
                color: z.string().regex(/^#[0-9a-f]{6}$/i),
                image: z.string().min(1),
            })
        )
        .max(40),
});

/**
 * Book editor save: title, dedication, page texts and colours, and which
 * of a page's pictures (current or earlier) to use. Free, no AI involved.
 */
export const POST = async (req: NextRequest) => {
    const locale = req.cookies.get("NEXT_LOCALE")?.value || "de";
    const t = await getTranslations({ locale });
    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { allowed } = await checkRateLimit(`edit:${ip}`, ratelimitPost);
    if (!allowed) {
        return NextResponse.json({
            success: false,
            message: t("messages.too-many-requests"),
        });
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({
            success: false,
            message: t("messages.bad-request"),
        });
    }
    const data = parsed.data;

    if (!(await canEditBook(data.bookId, data.key))) {
        return NextResponse.json({
            success: false,
            message: t("messages.unauthorized"),
        });
    }
    if (await isBookLocked(data.bookId)) {
        return NextResponse.json({
            success: false,
            message: t("pages.print.already"),
        });
    }

    const book = await db.books.getWithPages(data.bookId);
    if (!book) {
        return NextResponse.json({
            success: false,
            message: t("messages.bad-request"),
        });
    }

    await db.books.update(book.id, {
        title: data.title,
        dedication: data.dedication || null,
    });

    for (const edit of data.pages) {
        const page = book.pages.find((p) => p.id === edit.id);
        if (!page) continue;
        // Only this page's own pictures may be chosen.
        const images = [page.image, ...page.previousImages];
        const patch: { text?: string; color?: string; image?: string } = {};
        if (edit.text !== page.text) patch.text = edit.text;
        if (edit.color !== page.color) patch.color = edit.color;
        if (edit.image !== page.image && images.includes(edit.image)) {
            patch.image = edit.image;
        }
        if (Object.keys(patch).length) {
            await db.books.updatePage(book.id, page.id, patch);
        }
    }

    await refreshEmailedPDF(book.id, locale).catch((e) =>
        console.error("PDF refresh failed", e)
    );

    return NextResponse.json({
        success: true,
        message: t("pages.edit.saved"),
    });
};
