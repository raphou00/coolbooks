import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { hash } from "bcrypt";
import db from "@/lib/db";
import resetPasswordSchema, {
    type ResetPasswordSchema,
} from "@/schema/reset-password";
import { checkRateLimit, ratelimitPost } from "@/lib/rate-limiter";

export const POST = async (req: NextRequest) => {
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

        const { allowed } = await checkRateLimit(identifier, ratelimitPost);
        if (!allowed) {
            return NextResponse.json({
                redirect: new URL("/error?error=429", req.url),
            });
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

        const token = await db.tokens.byToken(code);

        if (!token) {
            return NextResponse.json({
                success: false,
                message: t("messages.code-invalid"),
            });
        }

        if (token.expiresAt < new Date()) {
            await db.tokens.delete(token.token);

            return NextResponse.json({
                success: false,
                message: t("messages.code-invalid"),
            });
        }

        await db.tokens.deleteByUser(token.userId);

        const hashedPassword = await hash(password, 10);
        await db.users.update(token.userId, { password: hashedPassword });

        return NextResponse.json({
            success: true,
            message: t("messages.password-updated"),
            redirect: "/login",
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
