import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/auth";
import db from "@/lib/db";
import { ratelimitBasePost } from "@/lib/rate-limiter";

export async function GET(req: NextRequest) {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")?.value || "en",
    });
    try {
        const user = await getUser();
        const identifier = req.headers.get("x-forwarded-for");

        if (!identifier) {
            return NextResponse.redirect(new URL("/error?error=403", req.url));
        }

        const { success } = await ratelimitBasePost.limit(identifier);
        if (!success) {
            return NextResponse.redirect(new URL("/error?error=429", req.url));
        }

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        await db.user.update({
            where: {
                id: user.user.id,
            },
            data: {
                googleId: null,
            },
        });

        return NextResponse.json({
            success: true,
            message: t("messages.google-disconnected"),
        });
    } catch (_) {
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
}
