import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/auth";
import env from "@/lib/env";
import type { Locale } from "@/lib/types";

export const GET = async (req: NextRequest) => {
    const locale = req.cookies.get("NEXT_LOCALE")?.value || ("en" as Locale);
    const t = await getTranslations({
        locale,
    });
    try {
        const priceId = req.nextUrl.searchParams.get("priceId");
        const user = await getUser();

        if (!user || !user.user) {
            return NextResponse.json({
                success: true,
                redirect: "/login?redirect=/pricing",
            });
        }

        if (!priceId) {
            return NextResponse.json({
                success: true,
                redirect: "/pricing",
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${env.APP_URL}/api/stripe/checkout?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${env.APP_URL}/pricing`,
            customer: user.user.stripeCustomerId || undefined,
            client_reference_id: user.user.id,
            locale: locale as Locale,
            metadata: {
                userId: user.user.id,
            },
            subscription_data: {
                metadata: {
                    userId: user.user.id,
                },
            },
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
