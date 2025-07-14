import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { lucia, getUser } from "@/lib/auth";
import { ratelimitBasePost } from "@/lib/rate-limiter";

export const POST = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")?.value || "en",
    });
    try {
        const identifier = req.headers.get("x-forwarded-for");

        if (!identifier) {
            return NextResponse.redirect(new URL("/error?error=403", req.url));
        }

        const { success } = await ratelimitBasePost.limit(identifier);
        if (!success) {
            return NextResponse.redirect(new URL("/error?error=429", req.url));
        }

        const user = await getUser();

        if (!user?.session) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        await db.session.delete({ where: { id: user.session?.id } });
        await lucia.invalidateSession(user.session!.id);

        const sessionCookie = lucia.createBlankSessionCookie();
        (await cookies()).set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        );

        return NextResponse.json({
            success: true,
            message: t("messages.logged-out"),
        });
    } catch (_) {
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
