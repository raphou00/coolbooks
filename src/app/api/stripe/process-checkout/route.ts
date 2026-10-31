import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { deliverOrder, isValidCallback } from "@/lib/orders";

/** Building and emailing the PDF can take a while for 12 pages. */
export const maxDuration = 120;

/**
 * Called by the book-creator Lambda when a book is ready. Only requests
 * carrying the shared secret are accepted.
 */
export const POST = async (req: NextRequest) => {
    if (!isValidCallback(req.headers.get("x-callback-secret"))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let orderId: string | undefined;
    try {
        ({ orderId } = (await req.json()) as { orderId?: string });
        if (!orderId) {
            return NextResponse.json(
                { error: "Missing orderId" },
                { status: 400 }
            );
        }

        await deliverOrder(orderId);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Delivery failed:", err);
        if (orderId) {
            await db.orders
                .update(orderId, {
                    status: "FAILED",
                    error: `delivery: ${String((err as Error)?.message ?? err)}`.slice(
                        0,
                        1000
                    ),
                })
                .catch(() => undefined);
        }
        return NextResponse.json(
            { error: "Processing failed" },
            { status: 500 }
        );
    }
};
