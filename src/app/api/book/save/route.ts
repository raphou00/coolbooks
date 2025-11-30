import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { checkRateLimit, ratelimitPost } from "@/lib/rate-limiter";

export async function POST(req: NextRequest) {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")?.value || "en",
    });
    try {
        const identifier = req.headers.get("x-forwarded-for");

        if (!identifier) {
            return NextResponse.json({
                redirect: new URL("/error?error=403", req.url),
            });
        }

        const { allowed, resetAt } = await checkRateLimit(
            identifier,
            ratelimitPost
        );
        if (!allowed) {
            return NextResponse.json({
                redirect: new URL("/error?error=429", req.url),
            });
        }

        const user = await getUser();

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        const { bookId, action } = await req.json();

        if (!bookId || !action) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        if (action !== "save" && action !== "unsave") {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        const book = await db.book.findUnique({
            where: { id: bookId },
        });

        if (!book) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        const isCurrentlySaved = user.user.savedBooks.includes(bookId);

        if (action === "save" && !isCurrentlySaved) {
            await db.user.update({
                where: { id: user.user.id },
                data: {
                    savedBooks: {
                        push: bookId,
                    },
                },
            });
        } else if (action === "unsave" && isCurrentlySaved) {
            const updatedSavedBooks = user.user.savedBooks.filter(
                (id) => id !== bookId
            );

            console.log(updatedSavedBooks);

            await db.user.update({
                where: { id: user.user.id },
                data: {
                    savedBooks: updatedSavedBooks,
                },
            });
        }

        return NextResponse.json({
            success: true,
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
