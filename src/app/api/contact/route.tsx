import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import contactSchema, { type ContactSchema } from "@/schema/contact";
import { checkRateLimit, ratelimitContact } from "@/lib/rate-limiter";
import sendEmail from "@/lib/email";
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

        const { allowed } = await checkRateLimit(identifier, ratelimitContact);
        if (!allowed) {
            return NextResponse.json({
                redirect: new URL("/error?error=429", req.url),
            });
        }

        const body = (await req.json()) as ContactSchema;

        const { error } = contactSchema(t).safeParse(body);

        if (error) {
            return NextResponse.json({
                success: false,
                errors: error.flatten().fieldErrors,
            });
        }

        await sendEmail(
            env.SENDER_EMAIL,
            body.email,
            body.subject,
            body.message,
            <div>
                <p>{body.name}</p> <p>{body.email}</p> <p>{body.message}</p>
            </div>
        );

        return NextResponse.json({
            success: true,
            message: t("messages.message-sent"),
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
