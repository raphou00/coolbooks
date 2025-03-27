import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import sendEmail from "@/lib/email";
import { createSixDigitNumber } from "@/lib/utils";
import forgotPasswordSchema, {
    type ForgotPasswordSchema,
} from "@/schema/forgot-password";
import ResetPasswordEmail from "@/components/emails/reset-password";
import env from "@/lib/env";

export const POST = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
        namespace: "messages",
    });
    try {
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

        const code = createSixDigitNumber();

        const link = new URL(`/reset-password?token=${code}`, env.APP_URL!);

        await db.token.create({
            data: {
                userId: user.id,
                token: code,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            },
        });

        await sendEmail(
            user.email,
            "Reset your password",
            <ResetPasswordEmail link={link.toString()} />
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
