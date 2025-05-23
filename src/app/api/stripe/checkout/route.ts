import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import { createSession, getUser } from "@/lib/auth";
import db from "@/lib/db";

export const GET = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
        namespace: "messages",
    });
    try {
        const searchParams = req.nextUrl.searchParams;
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
            return NextResponse.json({
                success: true,
                redirect: "/pricing",
            });
        }

        const user = await getUser();

        if (!user?.user) {
            return NextResponse.json({
                success: false,
                message: t("unauthorized"),
            });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["customer", "subscription"],
        });

        if (!session.customer || typeof session.customer === "string") {
            return NextResponse.json({
                success: false,
                message: t("unauthorized"),
            });
        }

        const customerId = session.customer.id;
        const subscriptionId =
        typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (!subscriptionId) {
            return NextResponse.json({
                success: false,
                message: t("unauthorized"),
            });
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
            expand: ["items.data.price.product"],
        });

        const plan = subscription.items.data[0]?.price;

        if (!plan) {
            return NextResponse.json({
                success: false,
                message: t("server-error"),
            });
        }

        const productId = (plan.product as Stripe.Product).id;

        if (!productId) {
            return NextResponse.json({
                success: false,
                message: t("server-error"),
            });
        }

        const userId = session.client_reference_id;
        if (!userId) {
            return NextResponse.json({
                success: false,
                message: t("server-error"),
            });
        }

        await db.user.update({
            where: {
                id: user.user.id
            },
            data: {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                stripeProductId: productId,
                planName: (plan.product as Stripe.Product).name,
                subscriptionStatus: subscription.status
            }
        })

        await createSession(user.user.id);

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
