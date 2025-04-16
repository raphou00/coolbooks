import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { hash, compare } from "bcrypt";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import updatePasswordSchema, {
    type UpdatePasswordSchema,
} from "@/schema/update-password";
import { ratelimitBasePost } from "@/lib/rate-limiter";

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

        const { success } = await ratelimitBasePost.limit(identifier);
        if (!success) {
            return NextResponse.redirect(new URL("/error?error=429", req.url));
        }

        const user = await getUser();
        const body = (await req.json()) as UpdatePasswordSchema;

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("unauthorized"),
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
                message: t("set-password-first"),
            });
        }

        if (
            !userdb ||
            !(await compare(body.currentPassword, userdb.password))
        ) {
            return NextResponse.json({
                success: false,
                message: t("current-password-wrong"),
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
            message: t("password-updated"),
        });
    } catch (_) {
        return NextResponse.json({
            success: false,
            message: t("server-error"),
        });
    }
};
