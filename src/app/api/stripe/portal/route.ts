import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import type Stripe from "stripe";
import { getUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import env from "@/lib/env";

export const GET = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")!.value,
        namespace: "messages",
    });
    try {
        const user = await getUser();

        if (!user?.user) {
            return NextResponse.json({
                success: true,
                redirect: "/login",
            });
        }

        if (!user.user.stripeCustomerId || !user.user.stripeProductId) {
            return NextResponse.json({
                success: true,
                redirect: "/pricing",
            });
        }

        let configuration: Stripe.BillingPortal.Configuration;
        const configurations = await stripe.billingPortal.configurations.list();

        if (configurations.data.length > 0) {
            configuration = configurations.data[0];
        } else {
            const product = await stripe.products.retrieve(
                user.user.stripeProductId
            );
            if (!product.active) {
                return NextResponse.json({
                    success: false,
                    message: t("server-error"),
                });
            }

            const prices = await stripe.prices.list({
                product: product.id,
                active: true,
            });
            if (prices.data.length === 0) {
                return NextResponse.json({
                    success: false,
                    message: t("server-error"),
                });
            }

            configuration = await stripe.billingPortal.configurations.create({
                business_profile: {
                    headline: t("billing"),
                },
                features: {
                    subscription_cancel: {
                        enabled: true,
                        mode: "at_period_end",
                        cancellation_reason: {
                            enabled: true,
                            options: [
                                "too_expensive",
                                "missing_features",
                                "switched_service",
                                "unused",
                                "other",
                            ],
                        },
                    },
                    payment_method_update: {
                        enabled: true,
                    },
                },
            });
        }

        const portal = await stripe.billingPortal.sessions.create({
            customer: user.user.stripeCustomerId,
            return_url: `${env.APP_URL}`,
            configuration: configuration.id,
        });

        return NextResponse.json({
            success: true,
            redirect: portal.url,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("server-error"),
        });
    }
};
