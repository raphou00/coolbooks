import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import type { localesTitle } from "@/lib/navigation";
import type { PageEditSchema } from "@/schema/page-edit";

export const POST = async (req: NextRequest) => {
    const locale = (req.cookies.get("NEXT_LOCALE")?.value ||
        "en") as keyof typeof localesTitle;
    const t = await getTranslations({ locale });
    try {
        const body = (await req.json()) as PageEditSchema;

        await db.page.update({
            where: {
                id: body.id,
            },
            data: body,
        });

        return NextResponse.json({
            success: true,
            message: t("messages.page-updated"),
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
