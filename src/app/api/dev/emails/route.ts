import { isLocal, listLocalEmails } from "@/lib/local";
import { devPage, esc, notFound } from "@/lib/local/page";

/** Local mode: every email the shop "sent", newest first. */
export const GET = async () => {
    if (!isLocal) return notFound();
    const emails = await listLocalEmails();
    const rows = emails
        .map(
            (e) =>
                `<tr><td>${esc(new Date(e.sentAt).toLocaleString("de-CH"))}</td><td>${esc(e.to)}</td><td><a href="/api/dev/emails/${esc(e.id)}">${esc(e.subject)}</a></td></tr>`
        )
        .join("");
    return devPage(
        "Local inbox",
        emails.length ?
            `<table><tr><th>Sent</th><th>To</th><th>Subject</th></tr>${rows}</table>`
        :   "<p>No emails yet. Place an order or register an account.</p>"
    );
};
