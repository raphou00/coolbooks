import { type NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { ratelimitBasePost } from "@/lib/rate-limiter";
import { getTranslations } from "next-intl/server";
import { localesTitle } from "@/lib/navigation";
import bookSchema, { type BookSchema } from "@/schema/book";
import { randomHex } from "@/config/colors";
import { createPlan, createImage } from "@/lib/ai";
import { getS3 } from "@/lib/utils";

export const POST = async (req: NextRequest) => {
    const locale = (req.cookies.get("NEXT_LOCALE")?.value ||
        "en") as keyof typeof localesTitle;
    const t = await getTranslations({ locale });
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
        const body = (await req.json()) as BookSchema;

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        const { error } = bookSchema(t).safeParse(body);

        if (error) {
            return NextResponse.json({
                success: false,
                errors: error.flatten().fieldErrors,
            });
        }

        const bookId = crypto.randomUUID();

        const plan = await createPlan(body.prompt);

        const coverKey = bookId + "/" + crypto.randomUUID() + ".png";
        const bookCover = await createImage(
            plan.cover,
            coverKey,
            null,
            plan.title
        );

        const book = await db.book.create({
            data: {
                id: bookId,
                title: plan.title,
                cover: coverKey,
                promptText: body.prompt,
                userId: user.user.id,
            },
        });

        for (const page of plan.pages) {
            const key = bookId + "/" + crypto.randomUUID() + ".png";
            await createImage(page.image, key, getS3(coverKey));
            await db.page.create({
                data: {
                    bookId: book.id,
                    color: randomHex(),
                    text: page.text,
                    images: {
                        create: {
                            src: key,
                            width: 1024,
                            height: 1024,
                        },
                    },
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: t("messages.book-created"),
            bookCover: bookCover,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
