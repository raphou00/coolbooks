import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/lib/types";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { checkRateLimit, ratelimitPost } from "@/lib/rate-limiter";

export const POST = async (req: NextRequest) => {
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
        const body = (await req.json()) as { locale: Locale };

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        if (!body) {
            return NextResponse.json({
                success: false,
                message: t("messages.bad-request"),
            });
        }

        await db.user.update({
            where: {
                id: user.user.id,
            },
            data: {
                locale: body.locale,
            },
        });

        return NextResponse.json({
            success: true,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
