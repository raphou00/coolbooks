import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import type { User } from "lucia";
import db from "@/lib/db";
import { ratelimitBasePost } from "@/lib/rate-limiter";
import socialExistsSchema, {
    type SocialExistsSchema,
} from "@/schema/social-exists";
import { createSession } from "@/lib/auth";

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

        const body = (await req.json()) as SocialExistsSchema;

        const { error } = await socialExistsSchema(t).safeParseAsync(body);

        if (error) {
            return NextResponse.json({
                success: false,
                errors: error.flatten().fieldErrors,
            });
        }

        let user: User | null = null;
        if (body.googleId) {
            user = (await db.user.create({
                data: {
                    name: body.name,
                    email: body.email,
                    googleId: body.googleId,
                },
            })) as User;
        } else {
            user = (await db.user.create({
                data: {
                    name: body.name,
                    email: body.email,
                    discordId: body.discordId,
                },
            })) as User;
        }

        await createSession(user.id);

        return NextResponse.json({
            success: true,
            redirect: "/",
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
