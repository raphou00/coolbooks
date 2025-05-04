import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { PurchaseReason, PurchaseStatus } from "@prisma/client";
import type Stripe from "stripe";
import db from "@/lib/db";
import { formatAmountForStripe } from "@/lib/utils";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/auth";
import tipsSchema, { type TipsSchema } from "@/schema/tips";
import sendEmail from "@/lib/email";
import { currency } from "@/config/stripe";
import Tips from "@/components/emails/tips";

export const POST = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
    });
    try {
        const user = await getUser();
        const body = (await req.json()) as TipsSchema;

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
            });
        }

        const { error } = tipsSchema(t).safeParse(body);

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

        let paymentIntent: Stripe.Response<Stripe.PaymentIntent>;
        try {
            paymentIntent = await stripe.paymentIntents.create({
                amount: formatAmountForStripe(body.amount),
                currency: currency,
                payment_method_types: ["card"],
                payment_method: body.paymentMethodId,
                confirm: true,
                error_on_requires_action: true,
            });
        } catch (err) {
            console.error(err);
            return NextResponse.json({
                success: true,
                redirect: `/${girl.username}?tips=failed`,
            });
        }

        if (!paymentIntent || paymentIntent.status !== "succeeded") {
            return NextResponse.json({
                success: true,
                redirect: `/${girl.username}?payment=failed`,
            });
        }

        await sendEmail(
            user.user.email,
            t("messages.tips-success", { name: girl.name }),
            <Tips
                t={t}
                amount={body.amount}
                girlName={girl.name}
                name={user.user.name}
            />
        );

        await db.purchase.create({
            data: {
                userId: user.user.id,
                girlId: body.modelId,
                amount: body.amount,
                reason: PurchaseReason.TIP,
                status: PurchaseStatus.PAID,
            },
        });

        return NextResponse.json({
            success: true,
            redirect: `/${girl.username}?tips=success`,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
