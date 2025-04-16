import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { findGirlsWithMedias } from "@/config/girl";
import { ratelimitSearch } from "@/lib/rate-limiter";

export const GET = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
        namespace: "messages",
    });
    try {
        const identifier = req.ip || req.headers.get("x-forwarded-for");

        if (!identifier) {
            return NextResponse.redirect(new URL("/error?error=403", req.url));
        }

        const { success } = await ratelimitSearch.limit(identifier);
        if (!success) {
            return NextResponse.redirect(new URL("/error?error=429", req.url));
        }

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
