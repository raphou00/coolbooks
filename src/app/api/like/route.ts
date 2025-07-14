import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { ratelimitBase } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")?.value || "en",
    });
    try {
        const identifier = req.headers.get("x-forwarded-for");

        if (!identifier) {
            return NextResponse.redirect(new URL("/error?error=403", req.url));
        }

        const { success } = await ratelimitBase.limit(identifier);
        if (!success) {
            return NextResponse.redirect(new URL("/error?error=429", req.url));
        }

        const user = await getUser();

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        const { mediaId, action } = await req.json();

        if (!mediaId || !action) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        if (action !== "like" && action !== "unlike") {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        const media = await db.media.findUnique({
            where: { id: mediaId },
        });

        if (!media) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        const currentUser = await db.user.findUnique({
            where: { id: user.user.id },
            select: { likedMedias: true },
        });

        if (!currentUser) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        const isCurrentlyLiked = currentUser.likedMedias.includes(mediaId);

        if (action === "like" && !isCurrentlyLiked) {
            await db.$transaction([
                db.media.update({
                    where: { id: mediaId },
                    data: { likes: { increment: 1 } },
                }),
                db.user.update({
                    where: { id: user.user.id },
                    data: {
                        likedMedias: {
                            push: mediaId,
                        },
                    },
                }),
            ]);
        } else if (action === "unlike" && isCurrentlyLiked) {
            const updatedLikedMedias = currentUser.likedMedias.filter(
                (id) => id !== mediaId
            );

            await db.$transaction([
                db.media.update({
                    where: { id: mediaId },
                    data: { likes: { decrement: 1 } },
                }),
                db.user.update({
                    where: { id: user.user.id },
                    data: {
                        likedMedias: updatedLikedMedias,
                    },
                }),
            ]);
        }

        const updatedMedia = await db.media.findUnique({
            where: { id: mediaId },
            select: { likes: true },
        });

        return NextResponse.json({
            success: true,
            likes: updatedMedia?.likes || 0,
            action: action,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
}
