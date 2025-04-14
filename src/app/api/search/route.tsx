import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { findGirlsWithMedias } from "@/config/girl";

export const GET = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
        namespace: "messages",
    });
    try {
        const q = req.nextUrl.searchParams.get("q")?.toLowerCase() || "";

        const girls = await db.girl.findMany({
            where: {
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { origin: { contains: q, mode: "insensitive" } },
                    { tags: { hasSome: [q] } },
                ],
            },
            select: findGirlsWithMedias,
        });

        return NextResponse.json({
            success: true,
            message: "/",
            girls,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("server-error"),
        });
    }
};
