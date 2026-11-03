import { NextResponse, type NextRequest } from "next/server";
import db from "@/lib/db";
import env from "@/lib/env";
import { mockPayments } from "@/lib/local";
import { devPage, esc, notFound } from "@/lib/local/page";
import { markOrderPaid } from "@/lib/orders";
import { formatAmountForDisplay } from "@/lib/utils";

/**
 * Local mode with PAYMENTS=mock: a stand-in for Stripe Checkout. Shows the
 * amount, asks for a Swiss address for printed books, then marks the order
 * paid exactly like the Stripe webhook does.
 */
export const GET = async (req: NextRequest) => {
    if (!mockPayments) return notFound();
    const orderId = req.nextUrl.searchParams.get("orderId") ?? "";
    const order = await db.orders.get(orderId);
    if (!order) return notFound();

    const isPrint = order.product === "PRINT";
    const field = (name: string, label: string, value = "") =>
        `<label>${label}<input name="${name}" value="${esc(value)}" required></label>`;

    return devPage(
        "Test payment (no money moves)",
        `<div class="box">
<p><b>${esc(formatAmountForDisplay(order.amount / 100))}</b> · ${isPrint ? "Hardcover + PDF" : "PDF"} · ${esc(order.email)}</p>
<form method="post">
<input type="hidden" name="orderId" value="${esc(order.id)}">
${
    isPrint ?
        `<p>Shipping address (Switzerland only)</p>
${field("name", "Name", "Lina Muster")}
${field("line1", "Street", "Bahnhofstrasse 1")}
${field("postal_code", "Postcode", "8001")}
${field("city", "City", "Zürich")}`
    :   ""
}
<button type="submit">Pay (test)</button>
</form></div>
<p><a href="${esc(env.APP_URL)}/?payment_success=false">Cancel</a></p>`
    );
};

export const POST = async (req: NextRequest) => {
    if (!mockPayments) return notFound();
    const form = await req.formData();
    const orderId = String(form.get("orderId") ?? "");
    const order = await db.orders.get(orderId);
    if (!order) return notFound();

    const shipping =
        order.product === "PRINT" ?
            {
                name: String(form.get("name") ?? ""),
                address: {
                    line1: String(form.get("line1") ?? ""),
                    line2: null,
                    postal_code: String(form.get("postal_code") ?? ""),
                    city: String(form.get("city") ?? ""),
                    state: null,
                    country: "CH",
                },
            }
        :   null;

    await markOrderPaid(order.id, {
        stripeSessionId: `mock_cs_${order.id}`,
        paymentIntentId: `mock_pi_${order.id}`,
        shipping,
    });

    return NextResponse.redirect(`${env.APP_URL}/?payment_success=true`, 303);
};
