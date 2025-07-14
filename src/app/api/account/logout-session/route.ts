import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
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
        const body = (await req.json()) as { sessionId: string };

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        await db.session.delete({
            where: {
                userId: user.user.id,
                id: body.sessionId,
            },
        });

        revalidatePath("/account/sessions");

        return NextResponse.json({
            success: true,
            message: t("messages.session-deleted"),
        });
    } catch (_) {
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
