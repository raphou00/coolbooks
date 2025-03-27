import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { compare } from "bcrypt";
import db from "@/lib/db";
import sendEmail from "@/lib/email";
import { createSession } from "@/lib/auth";
import loginSchema, { type LoginSchema } from "@/schema/login";
import Login from "@/components/emails/login";

export const POST = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
        namespace: "messages",
    });
    try {
        const body = (await req.json()) as LoginSchema;

        const { error } = loginSchema(t).safeParse(body);

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

        if (!user || !(await compare(body.password, user.password!))) {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            return NextResponse.json({
                success: false,
                message: t("invalid-credentials"),
            });
        }

        await sendEmail(
            user.email,
            "Someone logged into your account",
            <Login />
        );

        await createSession(user.id);

        return NextResponse.json({
            success: true,
            redirect: "/",
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("server-error"),
        });
    }
};
