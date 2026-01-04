import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { exportPDF } from "@/lib/export";
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

        if (!bookId) {
            return NextResponse.json({
                success: false,
                message: "Missing required parameters",
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
                pages: {
                    select: {
                        id: true,
                        text: true,
                        image: true,
                        color: true,
                        number: true,
                    },
                },
            },
        });

        if (!book) {
            return NextResponse.json({
                success: false,
                message: "Book not found",
            });
        }

        const blob = await exportPDF(book);

        if (!blob) {
            return NextResponse.json({
                success: false,
                message: "Failed to generate PDF",
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
        console.error("PDF generation error:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to generate PDF",
        });
    }
}
