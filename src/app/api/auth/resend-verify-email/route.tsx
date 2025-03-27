import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import sendEmail from "@/lib/email";
import { createSixDigitNumber } from "@/lib/utils";
import VerifyEmail from "@/components/emails/verify-email";

export const POST = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
        namespace: "messages",
    });
    try {
        const user = await getUser();

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("unauthorized"),
            });
        }

        const code = createSixDigitNumber();

        await db.token.create({
            data: {
                userId: user.user.id,
                token: code,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            },
        });

        await sendEmail(
            user.user.email,
            "Verify your e-mail",
            <VerifyEmail code={code} />
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
