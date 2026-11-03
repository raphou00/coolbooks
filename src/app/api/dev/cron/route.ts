import env from "@/lib/env";
import { isLocal } from "@/lib/local";
import { devPage, esc, notFound } from "@/lib/local/page";

/** Local mode: run the cron jobs once by hand (no scheduler locally). */
export const GET = async (req: Request) => {
    if (!isLocal) return notFound();
    const origin = new URL(req.url).origin;
    const jobs = ["/api/cron/orders"];
    const results = await Promise.all(
        jobs.map(async (job) => {
            const res = await fetch(origin + job, {
                headers: { authorization: `Bearer ${env.CRON_SECRET}` },
            });
            return `<div class="box"><b>${esc(job)}</b> → ${res.status}<pre>${esc(await res.text())}</pre></div>`;
        })
    );
    return devPage("Cron run", results.join(""));
};
