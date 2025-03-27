import { type NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";

export const POST = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
        namespace: "messages",
    });
    try {
        const user = await getUser();
        const body = (await req.json()) as { sessionId: string };

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("unauthorized"),
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
            message: t("session-deleted"),
        });
    } catch (_) {
        return NextResponse.json({
            success: false,
            message: t("server-error"),
        });
    }
};
