import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import verifyEmailSchema, {
    type VerifyEmailSchema,
} from "@/schema/verify-email";

export const POST = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
        namespace: "messages",
    });
    try {
        const user = await getUser();
        const body = (await req.json()) as VerifyEmailSchema;

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("unauthorized"),
            });
        }

        const { error } = verifyEmailSchema(t).safeParse(body);

        if (error) {
            return NextResponse.json({
                success: false,
                errors: error.flatten().fieldErrors,
            });
        }

        const code = await db.token.findFirst({
            where: {
                userId: user.user.id,
                token: body.otp,
            },
            select: {
                id: true,
                user: true,
                expiresAt: true,
            },
        });

        if (!code) {
            return NextResponse.json({
                success: false,
                message: t("code-invalid"),
            });
        }

        if (code.expiresAt < new Date()) {
            return NextResponse.json({
                success: false,
                message: t("code-invalid"),
            });
        }

        await db.token.delete({
            where: {
                userId: user.user.id,
                id: code.id,
            },
        });

        await db.user.update({
            where: {
                id: code.user.id,
            },
            data: {
                emailVerified: true,
            },
        });

        return NextResponse.json({
            success: true,
            message: t("email-verified"),
        });
    } catch (_) {
        return NextResponse.json({
            success: false,
            message: t("server-error"),
        });
    }
};
