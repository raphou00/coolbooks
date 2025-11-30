import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import type Stripe from "stripe";
import { getUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import env from "@/lib/env";
import { checkRateLimit, ratelimitPost } from "@/lib/rate-limiter";

export const GET = async (req: NextRequest) => {
    const t = await getTranslations({
        locale: req.cookies.get("NEXT_LOCALE")?.value || "en",
    });
    try {
        const identifier = req.headers.get("x-forwarded-for");

        if (!identifier) {
            return NextResponse.json({
                redirect: new URL("/error?error=403", req.url),
            });
        }

        const { allowed } = await checkRateLimit(identifier, ratelimitPost);
        if (!allowed) {
            return NextResponse.json({
                redirect: new URL("/error?error=429", req.url),
            });
        }

        const user = await getUser();

        if (!user?.user) {
            return NextResponse.json({
                redirect: "/login",
            });
        }

        if (!user.user.stripeCustomerId || !user.user.stripeProductId) {
            return NextResponse.json({
                redirect: "/pricing",
            });
        }

        let configuration: Stripe.BillingPortal.Configuration;
        const configurations = await stripe.billingPortal.configurations.list();

        if (configurations.data.length > 0) {
            configuration = configurations.data[0];
        } else {
            configuration = await stripe.billingPortal.configurations.create({
                business_profile: {
                    headline: t("messages.billing"),
                },
                default_return_url: `${env.APP_URL}/pricing`,
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
            redirect: portal.url,
        });
    } catch (err) {
        console.error(err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
