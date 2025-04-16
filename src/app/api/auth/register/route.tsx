import { type NextRequest, NextResponse } from "next/server";
import { hash } from "bcrypt";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import sendEmail from "@/lib/email";
import { createSession } from "@/lib/auth";
import { createSixDigitNumber } from "@/lib/utils";
import registerSchema, { type RegisterSchema } from "@/schema/register";
import Register from "@/components/emails/register";
import { ratelimitRegiser } from "@/lib/rate-limiter";

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

        const { success } = await ratelimitRegiser.limit(identifier);
        if (!success) {
            return NextResponse.redirect(new URL("/error?error=429", req.url));
        }

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
            t("emails.register.title"),
            <Register t={t} name={user.name} />
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
