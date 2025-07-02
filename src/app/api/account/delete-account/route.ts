import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import deleteAccountSchema, {
    type DeleteAccountSchema,
} from "@/schema/delete-account";
import { ratelimitBasePost } from "@/lib/rate-limiter";

export const POST = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
    });
    try {
        const identifier = req.headers.get("x-forwarded-for");

        if (!identifier) {
            return NextResponse.redirect(new URL("/error?error=403", req.url));
        }

        const { success } = await ratelimitBasePost.limit(identifier);
        if (!success) {
            return NextResponse.redirect(new URL("/error?error=429", req.url));
        }

        const user = await getUser();
        const body = (await req.json()) as DeleteAccountSchema;

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        const { error } = deleteAccountSchema(t).safeParse(body);

        if (error) {
            return NextResponse.json({
                success: false,
                errors: error.flatten().fieldErrors,
            });
        }

        if (body.email !== user.user?.email) {
            return NextResponse.json({
                success: false,
                message: t("messages.wrong-email"),
            });
        }

        await db.user.deleteMany({
            where: {
                id: user.user.id,
            },
        });

        return NextResponse.json({
            success: true,
            message: t("messages.account-deleted"),
        });
    } catch (_) {
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
