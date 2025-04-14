import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { formatAmountForStripe } from "@/lib/utils";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/auth";
import paymentSchema, { type PaymentSchema } from "@/schema/payment";

export const POST = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
        namespace: "messages",
    });
    try {
        const user = await getUser();
        const body = (await req.json()) as PaymentSchema;

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("unauthorized"),
            });
        }

        const { error } = paymentSchema(t).safeParse(body);

        if (error) {
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
                message: t("girl-not-found"),
            });
        }

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: formatAmountForStripe(girl.price, body.currency),
                currency: body.currency,
                payment_method_types: ["card"],
                payment_method: body.paymentMethodId,
                confirm: true,
                error_on_requires_action: true,
            });

            console.log(paymentIntent);
        } catch (err) {
            console.error(err);
            return NextResponse.json({
                success: false,
                message: t("payment-failed"),
            });
        }

        await db.girl.update({
            where: {
                id: body.modelId,
            },
            data: {
                likes: {
                    increment: 1,
                },
            },
        });

        await db.user.update({
            where: {
                id: user.user.id,
            },
            data: {
                girls: {
                    push: body.modelId,
                },
            },
        });

        return NextResponse.json({
            success: true,
            redirect: "/",
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("server-error"),
        });
    }
};
