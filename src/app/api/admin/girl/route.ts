import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/auth";
import { createGirl } from "@/lib/girl";
import type { Girl } from "@prisma/client";

export const POST = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
    });
    try {
        const formData = await req.formData();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const body = Object.fromEntries(formData) as any;
        const user = await getUser();

        if (!user?.user || user.user.role !== "ADMIN") {
            return NextResponse.json({
                success: false,
                message: t("unauthorized"),
            });
        }

        body.tags = body.tags.toString().split(",");
        body.price = parseFloat(body.price.toString());
        body.likes = parseInt(body.likes.toString());

        await createGirl(
            body as unknown as Girl,
            body.avatar as File,
            body.cover as File
        );

        return NextResponse.json({
            success: true,
            message: "Oouuuh YEAHHH",
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
