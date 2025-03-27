import { type NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import sendEmail from "@/lib/email";
import { createSession } from "@/lib/auth";
import { createSixDigitNumber } from "@/lib/utils";
import registerSchema, { type RegisterSchema } from "@/schema/register";
import VerifyEmail from "@/components/emails/verify-email";

export const POST = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
        namespace: "messages",
    });
    try {
        const body = (await req.json()) as RegisterSchema;

        const { error } = await registerSchema(t).safeParseAsync(body);

        if (error) {
            return NextResponse.json({
                success: false,
                errors: error.flatten().fieldErrors,
            });
        }

        const hashedPassword = await hash(body.password, 10);

        const user = await db.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: hashedPassword,
            },
        });

        await createSession(user.id);

        const code = createSixDigitNumber();

        await db.token.create({
            data: {
                userId: user.id,
                token: code,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000),
            },
        });

        await sendEmail(
            user.email,
            "Verify your e-mail",
            <VerifyEmail code={code} />
        );

        return NextResponse.json({
            success: true,
            redirect: "/",
        });
    } catch (_) {
        return NextResponse.json({
            success: false,
            message: t("server-error"),
        });
    }
};
