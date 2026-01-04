import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { checkRateLimit, ratelimitPost } from "@/lib/rate-limiter";

export const DELETE = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")?.value || "en",
    });
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

        const user = await getUser();

        if (!user?.user) {
            return NextResponse.json({
                redirect: new URL("/login", req.url),
            });
        }

        await db.user.delete({
            where: {
                id: user.user.id,
            },
        });

        return NextResponse.json({
            success: true,
            message: t("messages.account-deleted"),
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
