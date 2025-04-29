import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { PurchaseReason, PurchaseStatus } from "@prisma/client";
import db from "@/lib/db";
import { formatAmountForStripe } from "@/lib/utils";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/auth";
import paymentSchema, { type PaymentSchema } from "@/schema/payment";
import sendEmail from "@/lib/email";
import Payment from "@/components/emails/payment";
import { ratelimitPayment } from "@/lib/rate-limiter";
import { currency } from "@/config/stripe";

export const POST = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
    });
    try {
        const identifier = req.ip || req.headers.get("x-forwarded-for");

        if (!identifier) {
            return NextResponse.redirect(new URL("/error?error=403", req.url));
        }

        const { success } = await ratelimitPayment.limit(identifier);
        if (!success) {
            return NextResponse.redirect(new URL("/error?error=429", req.url));
        }

        const user = await getUser();
        const body = (await req.json()) as PaymentSchema;

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("messages.unauthorized"),
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
                message: t("messages.girl-not-found"),
            });
        }

        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: formatAmountForStripe(girl.price),
                currency: currency,
                payment_method_types: ["card"],
                payment_method: body.paymentMethodId,
                confirm: true,
                error_on_requires_action: true,
            });

            console.log(paymentIntent);
        } catch (err) {
            console.error(err);
            return NextResponse.json({
                success: true,
                redirect: `/${girl.username}?payment=failed`,
            });
        }

        await sendEmail(
            user.user.email,
            t("messages.payment-success", { name: girl.name }),
            <Payment
                t={t}
                amount={girl.price}
                girlName={girl.name}
                name={user.user.name}
            />
        );

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

        await db.purchase.create({
            data: {
                userId: user.user.id,
                girlId: body.modelId,
                amount: girl.price,
                reason: PurchaseReason.PAYMENT,
                status: PurchaseStatus.PAID,
            },
        });

        return NextResponse.json({
            success: true,
            redirect: `/${girl.username}?payment=success`,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
