import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import env from "@/lib/env";
import { maxGenerationAttempts } from "@/config/stripe";
import {
    deliverOrder,
    notifyAdmin,
    refundOrder,
    startGeneration,
} from "@/lib/orders";

export const maxDuration = 300;

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);

/**
 * Order sweeper, run every 10 minutes by the scheduler:
 *  - paid orders whose generation never started → start them
 *  - generations that went silent (Lambda crash or timeout) → mark failed
 *  - failed orders → retry, re-deliver, or refund after the last attempt
 */
export const GET = async (req: NextRequest) => {
    if (req.headers.get("authorization") !== `Bearer ${env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const summary = {
        started: 0,
        timedOut: 0,
        retried: 0,
        redelivered: 0,
        refunded: 0,
        errors: 0,
    };

    const run = async (fn: () => Promise<unknown>) => {
        try {
            await fn();
        } catch (err) {
            summary.errors++;
            console.error("Order sweeper:", err);
        }
    };

    // 1. Paid, but the webhook could not start the generator.
    for (const o of await db.orders.byStatus("PAID", minutesAgo(5))) {
        await run(async () => {
            await db.orders.update(o.id, {});
            await startGeneration(o.id);
            summary.started++;
        });
    }

    // 2. Generating for too long: the Lambda died without reporting.
    for (const o of await db.orders.byStatus("GENERATING", minutesAgo(20))) {
        const moved = await db.orders.transition(o.id, ["GENERATING"], {
            status: "FAILED",
            error: "Generation timed out",
        });
        if (moved) summary.timedOut++;
    }

    // 3. Failed: re-deliver a finished book, retry, or refund.
    for (const o of await db.orders.byStatus("FAILED")) {
        await run(async () => {
            const book = o.bookId ? await db.books.get(o.bookId) : null;
            if (book && !book.generating) {
                // The book is complete; only the PDF/email step failed.
                await deliverOrder(o.id);
                summary.redelivered++;
            } else if (o.attempts >= maxGenerationAttempts) {
                await refundOrder(o.id, o.error ?? "Unknown error");
                summary.refunded++;
            } else if (
                await db.orders.transition(o.id, ["FAILED"], { status: "PAID" })
            ) {
                await startGeneration(o.id);
                summary.retried++;
            }
        });
    }

    if (summary.errors > 0) {
        await notifyAdmin("Order sweeper errors", [
            `The order sweeper hit ${summary.errors} error(s). Check the logs.`,
            JSON.stringify(summary, null, 2),
        ]).catch(() => undefined);
    }

    return NextResponse.json(summary);
};
