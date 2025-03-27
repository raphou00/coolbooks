import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { lucia, getUser } from "@/lib/auth";

export const POST = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
        namespace: "messages",
    });
    try {
        const user = await getUser();

        if (!user?.session) {
            return NextResponse.json({
                success: false,
                message: t("unauthorized"),
            });
        }

        await db.session.delete({ where: { id: user.session?.id } });
        await lucia.invalidateSession(user.session!.id);

        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        );

        return NextResponse.json({
            success: true,
            message: t("logged-out"),
        });
    } catch (_) {
        return NextResponse.json({
            success: false,
            message: t("server-error"),
        });
    }
};
