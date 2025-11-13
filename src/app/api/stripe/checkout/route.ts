import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import { getUser } from "@/lib/auth";
import db from "@/lib/db";

export const GET = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")?.value || "en",
    });
    try {
        const searchParams = req.nextUrl.searchParams;
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
            return NextResponse.redirect(new URL("/pricing", req.url));
        }

        const user = await getUser();

        if (!user?.user) {
            return NextResponse.redirect(new URL("/error?error=400", req.url));
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["customer", "subscription"],
        });

        if (!session.customer || typeof session.customer === "string") {
            return NextResponse.redirect(new URL("/error?error=400", req.url));
        }

        const customerId = session.customer.id;
        const subscriptionId =
            typeof session.subscription === "string" ?
                session.subscription
            :   session.subscription?.id;

        if (!subscriptionId) {
            return NextResponse.redirect(new URL("/error?error=400", req.url));
        }

        const subscription = await stripe.subscriptions.retrieve(
            subscriptionId,
            {
                expand: ["items.data.price.product"],
            }
        );

        const plan = subscription.items.data[0]?.price;

        if (!plan) {
            return NextResponse.redirect(new URL("/error?error=500", req.url));
        }

        const productId = (plan.product as Stripe.Product).id;

        if (!productId) {
            return NextResponse.redirect(new URL("/error?error=400", req.url));
        }

        const userId = session.client_reference_id;
        if (!userId) {
            return NextResponse.redirect(new URL("/error?error=400", req.url));
        }

        await db.user.update({
            where: {
                id: user.user.id,
            },
            data: {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                stripeProductId: productId,
                subscriptionStatus: subscription.status,
            },
        });

        return NextResponse.redirect(new URL("/?payment=true", req.url));
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
