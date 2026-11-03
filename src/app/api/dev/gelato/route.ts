import { NextResponse, type NextRequest } from "next/server";
import db from "@/lib/db";
import { isLocal } from "@/lib/local";
import { devPage, esc, notFound } from "@/lib/local/page";
import { applyGelatoUpdate } from "@/lib/printing";

/** Local mode: list print orders and pretend to be Gelato. */
export const GET = async () => {
    if (!isLocal) return notFound();
    const statuses = [
        "AWAITING_CONFIRMATION",
        "SUBMITTED",
        "IN_PRODUCTION",
        "SHIPPED",
        "DELIVERED",
        "FAILED",
        "CANCELED",
    ] as const;
    const prints = (
        await Promise.all(statuses.map((s) => db.prints.byStatus(s)))
    ).flat();
    const button = (id: string, s: string) =>
        `<button name="status" value="${s}" style="margin:2px">${s}</button>`;
    const rows = prints
        .map(
            (
                p
            ) => `<tr><td><code>${esc(p.id.slice(0, 8))}</code></td><td>${esc(p.status)}</td><td>${esc(p.email)}</td>
<td><a href="/book/${esc(p.bookId)}/print?key=${esc(p.orderId)}">print page</a></td>
<td><form method="post"><input type="hidden" name="printId" value="${esc(p.id)}">
${["in_production", "shipped", "delivered", "failed"].map((s) => button(p.id, s)).join("")}
</form></td></tr>`
        )
        .join("");
    return devPage(
        "Gelato simulator",
        `<p>Sends the same updates Gelato's webhook would. "shipped" adds a fake tracking link.</p>
${prints.length ? `<table><tr><th>Print</th><th>Status</th><th>Email</th><th></th><th>Simulate</th></tr>${rows}</table>` : "<p>No print orders yet. Order a hardcover first.</p>"}`
    );
};

export const POST = async (req: NextRequest) => {
    if (!isLocal) return notFound();
    const form = await req.formData();
    const printId = String(form.get("printId") ?? "");
    const status = String(form.get("status") ?? "");
    await applyGelatoUpdate({
        printId,
        fulfillmentStatus: status,
        trackingUrl:
            status === "shipped" ?
                `https://www.post.ch/track?formattedParcelCodes=99.00.123456.${printId.slice(0, 8)}`
            :   null,
    });
    return NextResponse.redirect(new URL("/api/dev/gelato", req.url), 303);
};
