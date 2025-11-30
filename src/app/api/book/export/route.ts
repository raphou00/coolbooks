import { selectBook } from "@/config/book";
import db from "@/lib/db";
import { exportEPUB, exportPDF } from "@/lib/export";
import { type NextRequest, NextResponse } from "next/server";
import { checkRateLimit, ratelimitPost } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
    try {
        const identifier = req.headers.get("x-forwarded-for");

        if (!identifier) {
            return NextResponse.json({
                redirect: new URL("/error?error=403", req.url),
            });
        }

        const { allowed } = await checkRateLimit(identifier, ratelimitPost);
        if (!allowed) {
            return NextResponse.json({
                redirect: new URL("/error?error=429", req.url),
            });
        }

        const bookId = req.nextUrl.searchParams.get("bookId");
        const format = req.nextUrl.searchParams.get("format");
        const orientation = req.nextUrl.searchParams.get("orientation");

        if (!bookId || !format || (format == "pdf" && !orientation)) {
            return NextResponse.json({
                success: false,
                message: "Missing required parameters",
            });
        }

        const book = await db.book.findUnique({
            where: {
                id: bookId,
            },
            select: selectBook,
        });

        if (!book) {
            return NextResponse.json({
                success: false,
                message: "Book not found",
            });
        }

        let blob;
        if (format == "pdf") {
            blob = await exportPDF(
                book,
                orientation as "portrait" | "landscape"
            );
        } else if (format == "epub") {
            blob = await exportEPUB(book);
        }

        if (!blob) {
            return NextResponse.json({
                success: false,
                message: "Failed to generate EPUB",
            });
        }

        return new NextResponse(blob, {
            status: 200,
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Length": blob.size.toString(),
            },
        });
    } catch (error) {
        console.error("EPUB generation error:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Failed to generate EPUB",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
