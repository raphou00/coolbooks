import { type NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import sendEmail from "@/lib/email";
import { createSession } from "@/lib/auth";
import registerSchema, { type RegisterSchema } from "@/schema/register";
import Register from "@/components/emails/register";
import { checkRateLimit, ratelimitRegiser } from "@/lib/rate-limiter";
import env from "@/lib/env";

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

        const { allowed } = await checkRateLimit(identifier, ratelimitRegiser);
        if (!allowed) {
            return NextResponse.json({
                redirect: new URL("/error?error=429", req.url),
            });
        }

        const body = (await req.json()) as RegisterSchema;

        const { error } = await (await registerSchema(t)).safeParseAsync(body);

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

        await sendEmail(
            user.email,
            env.SENDER_EMAIL,
            t("emails.register.title"),
            t("emails.register.body"),
            <Register t={t} name={user.name} />
        );

        return NextResponse.json({
            success: true,
            message: t("messages.register-success"),
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
