import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { compare } from "bcrypt";
import db from "@/lib/db";
import { createSession } from "@/lib/auth";
import loginSchema, { type LoginSchema } from "@/schema/login";
import { checkRateLimit, ratelimitLogin } from "@/lib/rate-limiter";

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

        const { allowed } = await checkRateLimit(identifier, ratelimitLogin);
        if (!allowed) {
            return NextResponse.json({
                redirect: new URL("/error?error=429", req.url),
            });
        }

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
                message: t("messages.invalid-credentials"),
            });
        }

        await createSession(user.id);

        return NextResponse.json({
            success: true,
            message: t("messages.login-success"),
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
