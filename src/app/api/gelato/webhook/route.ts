import { timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import env from "@/lib/env";
import { applyGelatoUpdate } from "@/lib/printing";

const validSecret = (given: string | null) => {
    const secret = env.GELATO_WEBHOOK_SECRET;
    if (!secret || !given) return false;
    const a = Buffer.from(given);
    const b = Buffer.from(secret);
    return a.length === b.length && timingSafeEqual(a, b);
};

/**
 * Gelato order updates. Register this URL in the Gelato dashboard as
 * https://<site>/api/gelato/webhook?secret=<GELATO_WEBHOOK_SECRET>
 * for "order status updated" and "tracking code updated".
 */
export const POST = async (req: NextRequest) => {
    if (!validSecret(req.nextUrl.searchParams.get("secret"))) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = (await req.json()) as {
        event?: string;
        orderReferenceId?: string;
        fulfillmentStatus?: string;
        trackingUrl?: string;
        items?: { fulfillments?: { trackingUrl?: string }[] }[];
    };
    if (!event.orderReferenceId) return NextResponse.json({ ignored: true });

    const trackingUrl =
        event.trackingUrl ??
        event.items?.[0]?.fulfillments?.[0]?.trackingUrl ??
        null;

    try {
        const result = await applyGelatoUpdate({
            printId: event.orderReferenceId,
            fulfillmentStatus:
                event.event === "order_status_updated" ?
                    event.fulfillmentStatus
                :   null,
            trackingUrl,
        });
        return NextResponse.json(result);
    } catch (err) {
        console.error("Gelato webhook failed:", err);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
};
