import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import paymentSchema, { type PaymentSchema } from "@/schema/payment";
import { stripe } from "@/lib/stripe";
import { formatAmountForStripe } from "@/lib/utils";

export const POST = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
        namespace: "messages",
    });
    try {
        const body = (await req.json()) as PaymentSchema;

        const { error } = paymentSchema(t).safeParse(body);

        if (error) {
            return NextResponse.json({
                success: false,
                errors: error.flatten().fieldErrors,
            });
        }

        const creator = await db.creator.findFirst({
            where: {
                id: body.modelId,
            },
        });

        if (!creator) {
            return NextResponse.json({
                success: false,
                message: t("creator-not-found"),
            });
        }

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: formatAmountForStripe(creator.price, body.currency),
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
