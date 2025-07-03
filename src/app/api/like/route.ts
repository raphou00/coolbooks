import { NextResponse, type NextRequest } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
    });
    try {
        const mediaId = req.nextUrl.searchParams.get("mediaId");

        if (!mediaId) {
            return NextResponse.json({
                success: false,
                message: t("messages.bad-request"),
            });
        }

        const user = await getUser();

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        await db.media.update({
            where: {
                id: mediaId,
            },
            data: {
                likes: {
                    increment: 1,
                },
            },
        });

        await db.user.update({
            where: {
                id: user.user.id,
            },
            data: {
                likedMedias: {
                    push: mediaId,
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: "done",
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
}

export async function DELETE(req: NextRequest) {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
    });
    try {
        const mediaId = req.nextUrl.searchParams.get("mediaId");

        if (!mediaId) {
            return NextResponse.json({
                success: false,
                message: t("messages.bad-request"),
            });
        }

        const user = await getUser();

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        await db.media.update({
            where: {
                id: mediaId,
            },
            data: {
                likes: {
                    decrement: 1,
                },
            },
        });

        await db.user.update({
            where: {
                id: user.user.id,
            },
            data: {
                likedMedias: {
                    set: user.user.likedMedias.filter((id) => id !== mediaId),
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: "",
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
}
