import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { z } from "zod";
import db from "@/lib/db";
import env from "@/lib/env";
import sendEmail from "@/lib/email";
import { notifyAdmin } from "@/lib/orders";
import { REVIEW_PERCENT, createRewardCode } from "@/lib/printing";
import NoticeEmail from "@/components/emails/notice";

const schema = z.object({
    token: z.string().min(10).max(64),
    rating: z.number().int().min(1).max(5),
    text: z.string().trim().max(1000),
});

/** One review per printed book; any review earns the same 15% code. */
export const POST = async (req: NextRequest) => {
    const locale = req.cookies.get("NEXT_LOCALE")?.value || "de";
    const t = await getTranslations({ locale });

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
        return NextResponse.json({
            success: false,
            message: t("messages.bad-request"),
        });
    }
    const { token, rating, text } = parsed.data;

    const print = await db.prints.byReviewToken(token);
    if (!print) {
        return NextResponse.json({
            success: false,
            message: t("pages.review.invalid"),
        });
    }
    if (!["SHIPPED", "DELIVERED"].includes(print.status)) {
        return NextResponse.json({
            success: false,
            message: t("pages.review.not-yet"),
        });
    }

    const existing = await db.reviews.get(print.id);
    if (existing) {
        return NextResponse.json({ success: true, code: existing.promoCode });
    }

    const { code, expires } = await createRewardCode(print.id);
    const review = await db.reviews.create({
        printId: print.id,
        bookId: print.bookId,
        email: print.email,
        locale: print.locale,
        rating,
        text,
        promoCode: code,
    });
    if (!review) {
        const again = await db.reviews.get(print.id);
        return NextResponse.json({ success: true, code: again?.promoCode });
    }

    const tm = await getTranslations({ locale: print.locale });
    const until = expires.toLocaleDateString("de-CH");
    const values = { percent: REVIEW_PERCENT, until };
    await sendEmail(
        print.email,
        env.SENDER_EMAIL,
        tm("emails.review-reward.title", values),
        tm("emails.review-reward.body", values),
        <NoticeEmail
            t={tm}
            kind="review-reward"
            values={values}
            highlight={code}
            href={`${env.APP_URL}/new`}
        />
    );
    await notifyAdmin(`New review (${rating}★) to moderate`, [
        text || "(no text)",
        "",
        `Approve it at ${env.APP_URL}/admin/reviews`,
    ]);

    return NextResponse.json({ success: true, code, until });
};
