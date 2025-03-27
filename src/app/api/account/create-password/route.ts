import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { hash } from "bcrypt";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import createPasswordSchema, {
    type CreatePasswordSchema,
} from "@/schema/create-password";

export const POST = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
        namespace: "messages",
    });
    try {
        const user = await getUser();
        const body = (await req.json()) as CreatePasswordSchema;

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("unauthorized"),
            });
        }

        const { error } = createPasswordSchema(t).safeParse(body);

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

        if (userdb?.password) {
            return NextResponse.json({
                success: false,
                message: t("already-have-password"),
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
            message: t("password-created"),
        });
    } catch (_) {
        return NextResponse.json({
            success: false,
            message: t("server-error"),
        });
    }
};
