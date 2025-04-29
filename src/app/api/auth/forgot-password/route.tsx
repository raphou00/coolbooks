import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import sendEmail from "@/lib/email";
import forgotPasswordSchema, {
    type ForgotPasswordSchema,
} from "@/schema/forgot-password";
import ResetPasswordEmail from "@/components/emails/reset-password";
import { ratelimitForgotPassword } from "@/lib/rate-limiter";

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

        const { success } = await ratelimitForgotPassword.limit(identifier);
        if (!success) {
            return NextResponse.redirect(new URL("/error?error=429", req.url));
        }

        const body = (await req.json()) as ForgotPasswordSchema;

        const { error } = forgotPasswordSchema(t).safeParse(body);

        if (error) {
            return NextResponse.json({
                success: false,
                errors: error.flatten().fieldErrors,
            });
        }

        const user = await db.user.findFirst({
            where: {
                email: body.email,
            },
        });

        if (!user) {
            return NextResponse.json({
                success: true,
                message: t("email-sent"),
            });
        }

        const code = crypto.randomUUID();

        await db.token.create({
            data: {
                userId: user.id,
                token: code,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            },
        });

        await sendEmail(
            user.email,
            t("emails.forgot-password.title"),
            <ResetPasswordEmail t={t} code={code} name={user.name} />
        );

        return NextResponse.json({
            success: true,
            message: t("email-sent"),
        });
    } catch (_) {
        return NextResponse.json({
            success: false,
            message: t("server-error"),
        });
    }
};
