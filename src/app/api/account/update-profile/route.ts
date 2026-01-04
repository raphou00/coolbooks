import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import updateProfileSchema, {
    type UpdateProfileSchema,
} from "@/schema/update-profile";
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
        const body = (await req.json()) as UpdateProfileSchema;

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        const { error } = await updateProfileSchema(
            t,
            user.user.email
        ).safeParseAsync(body);

        if (error) {
            return NextResponse.json({
                success: false,
                errors: error.flatten().fieldErrors,
            });
        }

        await db.user.update({
            where: {
                id: user.user.id,
            },
            data: {
                name: body.name,
                email: body.email,
            },
        });

        return NextResponse.json({
            success: true,
            message: t("messages.profile-updated"),
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
