import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { canEditBook } from "@/lib/books";
import { readObject } from "@/lib/file";
import { printOfBook, renderPrint } from "@/lib/printing";
import { checkRateLimit, ratelimitPost } from "@/lib/rate-limiter";

export const maxDuration = 120;

/**
 * The print PDF exactly as it would be (or was) sent to the printer.
 * Before confirmation it is built from the current book; afterwards the
 * stored file is returned. Warnings travel in the `x-print-warnings` header.
 */
export const GET = async (req: NextRequest) => {
    const bookId = req.nextUrl.searchParams.get("bookId") ?? "";
    const key = req.nextUrl.searchParams.get("key");
    if (!bookId || !(await canEditBook(bookId, key))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const { allowed } = await checkRateLimit(`print:${ip}`, ratelimitPost);
    if (!allowed) {
        return NextResponse.json(
            { error: "Too many requests" },
            { status: 429 }
        );
    }

    const print = await printOfBook(bookId);
    const headers = {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="print-${bookId}.pdf"`,
        "cache-control": "no-store",
    };

    if (print?.pdfKey) {
        const pdf = await readObject(print.pdfKey);
        return new Response(new Uint8Array(pdf), {
            headers: { ...headers, "x-print-warnings": "[]" },
        });
    }

    const book = await db.books.getWithPages(bookId);
    if (!book)
        return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { pdf, warnings, coverEstimated } = await renderPrint(
        {
            title: book.title,
            cover: book.cover,
            dedication: book.dedication,
            pages: book.pages,
        },
        print?.locale ?? req.cookies.get("NEXT_LOCALE")?.value ?? "de"
    );
    return new Response(new Uint8Array(pdf), {
        headers: {
            ...headers,
            "x-print-warnings": JSON.stringify(warnings),
            "x-cover-estimated": String(coverEstimated),
        },
    });
};
