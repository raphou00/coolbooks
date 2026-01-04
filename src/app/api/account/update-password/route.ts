import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { hash, compare } from "bcrypt";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import updatePasswordSchema, {
    type UpdatePasswordSchema,
} from "@/schema/update-password";
import { checkRateLimit, ratelimitPost } from "@/lib/rate-limiter";

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

        const { allowed } = await checkRateLimit(identifier, ratelimitPost);
        if (!allowed) {
            return NextResponse.json({
                redirect: new URL("/error?error=429", req.url),
            });
        }

        const user = await getUser();
        const body = (await req.json()) as UpdatePasswordSchema;

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        const { error } = updatePasswordSchema(t).safeParse(body);

        if (error) {
            return NextResponse.json({
                success: false,
                errors: error.flatten().fieldErrors,
            });
        }

        const userdb = await db.user.findUnique({
            where: {
                id: user.user.id,
            },
        });

        if (!userdb?.password) {
            return NextResponse.json({
                success: false,
                message: t("messages.set-password-first"),
            });
        }

        if (
            !userdb ||
            !(await compare(body.currentPassword, userdb.password))
        ) {
            return NextResponse.json({
                success: false,
                message: t("messages.current-password-wrong"),
            });
        }

        await db.user.updateMany({
            where: {
                id: user.user.id,
            },
            data: {
                password: await hash(body.newPassword, 10),
            },
        });

        return NextResponse.json({
            success: true,
            message: t("messages.password-updated"),
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
