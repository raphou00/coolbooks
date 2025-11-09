import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { ratelimitBasePost } from "@/lib/rate-limiter";
import { type localesTitle } from "@/lib/navigation";
import bookSchema, { type BookSchema } from "@/schema/book";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import env from "@/lib/env";

const client = new LambdaClient({ region: "us-east-1" });

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

        if (user.user.credits < 1) {
            return NextResponse.json({
                success: false,
                message: t("messages.no-credits"),
            });
        }

        await db.user.update({
            where: {
                id: user.user.id,
            },
            data: {
                credits: {
                    decrement: 1,
                },
            },
        });

        const bookId = crypto.randomUUID();
        const userId = user.user.id;

        const command = new InvokeCommand({
            FunctionName: env.BOOK_CREATOR_LAMBDA_ARN,
            InvocationType: "Event",
            Payload: Buffer.from(
                JSON.stringify({ bookId, userId, topic: body })
            ),
        });

        await client.send(command);

        return NextResponse.json({
            success: true,
            message: t("messages.book-creating"),
            bookId,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
