import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import resetPasswordSchema, {
    type ResetPasswordSchema,
} from "@/schema/reset-password";
import { ratelimitBasePost } from "@/lib/rate-limiter";

export const POST = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
        namespace: "messages",
    });
    try {
        const identifier = req.ip || req.headers.get("x-forwarded-for");

        if (!identifier) {
            return NextResponse.redirect(new URL("/error?error=403", req.url));
        }

        const { success } = await ratelimitBasePost.limit(identifier);
        if (!success) {
            return NextResponse.redirect(new URL("/error?error=429", req.url));
        }

        const body = (await req.json()) as ResetPasswordSchema;

        const { error } = resetPasswordSchema(t).safeParse(body);

        if (error) {
            return NextResponse.json({
                success: false,
                errors: error.flatten().fieldErrors,
            });
        }

        const code = body.code;
        const password = body.password;

        const token = await db.token.findFirst({
            where: {
                token: code,
            },
            select: {
                id: true,
                userId: true,
                expiresAt: true,
            },
        });

        if (!token) {
            return NextResponse.json({
                success: false,
                message: t("code-invalid"),
            });
        }

        if (token.expiresAt < new Date()) {
            return NextResponse.json({
                success: false,
                message: t("code-invalid"),
            });
        }

        await db.token.deleteMany({
            where: {
                userId: token.userId,
            },
        });

        await db.user.update({
            where: {
                id: token.userId,
            },
            data: {
                password: password,
            },
        });

        return NextResponse.json({
            success: true,
            message: t("password-updated"),
        });
    } catch (_) {
        return NextResponse.json({
            success: false,
            message: t("server-error"),
        });
    }
};
