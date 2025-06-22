import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/auth";
import env from "@/lib/env";
import { productId } from "@/config/stripe";

export const GET = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
        namespace: "pages.pricing",
    });
    try {
        const user = await getUser();

        if (!user || !user.user) {
            return NextResponse.json({
                success: true,
                redirect: "/login?redirect=/pricing",
            });
        }

        const priceId = await stripe.prices.list({ product: productId });
        if (!priceId.data[0].id) {
            return NextResponse.json({
                success: true,
                redirect: "/pricing",
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId.data[0].id,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${env.APP_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${env.APP_URL}/pricing`,
            customer: user.user.stripeCustomerId || undefined,
            client_reference_id: user.user.id,
        });

        return NextResponse.json({
            success: true,
            redirect: session.url,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
