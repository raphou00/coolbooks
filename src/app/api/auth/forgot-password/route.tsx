import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import sendEmail from "@/lib/email";
import forgotPasswordSchema, {
    type ForgotPasswordSchema,
} from "@/schema/forgot-password";
import ResetPasswordEmail from "@/components/emails/reset-password";
import { checkRateLimit, ratelimitForgotPassword } from "@/lib/rate-limiter";
import env from "@/lib/env";

export const dynamic = "force-dynamic";

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

        const { allowed } = await checkRateLimit(
            identifier,
            ratelimitForgotPassword
        );
        if (!allowed) {
            return NextResponse.json({
                redirect: new URL("/error?error=429", req.url),
            });
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
                message: t("messages.email-sent"),
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
            env.SENDER_EMAIL,
            t("emails.forgot-password.title"),
            t("emails.forgot-password.body"),
            <ResetPasswordEmail t={t} code={code} name={user.name} />
        );

        return NextResponse.json({
            success: true,
            message: t("messages.email-sent"),
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
