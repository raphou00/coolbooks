import { NextResponse, type NextRequest } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
    });
    try {
        const body = await req.json();
        const mediaId = body.mediaId;

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

        const isLiked = user.user.likedMedias.includes(mediaId);

        if (isLiked) {
            await db.$transaction([
                db.user.update({
                    where: { id: user.user.id },
                    data: {
                        likedMedias: user.user.likedMedias.filter(
                            (id) => id !== mediaId
                        ),
                    },
                }),
                db.media.update({
                    where: { id: mediaId },
                    data: {
                        likes: { decrement: 1 },
                    },
                }),
            ]);

            return NextResponse.json({
                liked: false,
                message: "Media unliked successfully",
            });
        } else {
            await db.$transaction([
                db.user.update({
                    where: { id: user.user.id },
                    data: {
                        likedMedias: [...user.user.likedMedias, mediaId],
                    },
                }),
                db.media.update({
                    where: { id: mediaId },
                    data: {
                        likes: { increment: 1 },
                    },
                }),
            ]);

            return NextResponse.json({
                liked: true,
                message: "Media liked successfully",
            });
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
}
