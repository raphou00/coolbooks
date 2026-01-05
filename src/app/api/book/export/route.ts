import { type NextRequest, NextResponse } from "next/server";
import { checkRateLimit, ratelimitPost } from "@/lib/rate-limiter";
import env from "@/lib/env";

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

        const response = await fetch(
            `${env.NEXT_PUBLIC_CLOUDFRONT_URL}/${bookId}/${bookId}.pdf`
        );
        const buffer = await response.arrayBuffer();
        const blob = new Blob([buffer], { type: "application/pdf" });

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
