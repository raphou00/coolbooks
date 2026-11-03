import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import type Stripe from "stripe";
import db from "@/lib/db";
import env from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { getUser } from "@/lib/auth";
import { routing } from "@/lib/navigation";
import { checkRateLimit, ratelimitPost } from "@/lib/rate-limiter";
import { formatAmountForStripe } from "@/lib/utils";
import { mockPayments } from "@/lib/local";
import {
    currency,
    priceFor,
    printEnabled,
    shippingCountries,
} from "@/config/stripe";
import { checkoutSchema, type CheckoutSchema } from "@/schema/book";

export const POST = async (req: NextRequest) => {
    const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;
    const locale =
        routing.locales.includes(cookieLocale as never) ?
            (cookieLocale as string)
        :   routing.defaultLocale;
    const t = await getTranslations({ locale });

    try {
        const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
        if (!ip) {
            return NextResponse.json({
                redirect: new URL("/error?error=403", req.url),
            });
        }

        const { allowed } = await checkRateLimit(ip, ratelimitPost);
        if (!allowed) {
            return NextResponse.json({
                redirect: new URL("/error?error=429", req.url),
            });
        }

        const body = (await req.json()) as CheckoutSchema;
        const parsed = checkoutSchema(t).safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({
                success: false,
                errors: parsed.error.flatten().fieldErrors,
            });
        }
        const data = parsed.data;

        if (data.product === "PRINT" && !printEnabled) {
            return NextResponse.json({
                success: false,
                message: t("messages.bad-request"),
            });
        }

        // Only a cover the parent has actually seen can be bought.
        const preview = await db.previews.get(data.previewId);
        if (!preview?.cover || !preview.title) {
            return NextResponse.json({
                success: false,
                message: t("messages.preview-expired"),
            });
        }

        const user = await getUser();
        const amount = formatAmountForStripe(priceFor(data.product));

        const order = await db.orders.create({
            product: data.product,
            email: data.email,
            locale,
            amount,
            currency,
            previewId: preview.id,
            userId: user?.user?.id ?? null,
            dedication: data.dedication || null,
            giftTo: data.isGift ? data.giftTo : null,
            giftFrom: data.isGift ? data.giftFrom : null,
        });

        if (mockPayments) {
            return NextResponse.json({
                redirect: `${env.APP_URL}/api/dev/pay?orderId=${order.id}`,
            });
        }

        const isPrint = data.product === "PRINT";
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency,
                        unit_amount: amount,
                        product_data: {
                            name:
                                isPrint ?
                                    `${preview.title} · ${t("pages.new-book.print")}`
                                :   preview.title,
                            description: t("common.name"),
                            images: [`${env.CLOUDFRONT_URL}/${preview.cover}`],
                        },
                    },
                },
            ],
            ...(isPrint && {
                shipping_address_collection: {
                    allowed_countries: [
                        ...shippingCountries,
                    ] as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
                },
            }),
            ...(user?.user?.stripeCustomerId ?
                { customer: user.user.stripeCustomerId }
            :   { customer_email: data.email }),
            // Lets customers use their 15% review reward code.
            allow_promotion_codes: true,
            success_url: `${env.APP_URL}/?payment_success=true`,
            cancel_url: `${env.APP_URL}/?payment_success=false`,
            locale: locale as Stripe.Checkout.SessionCreateParams.Locale,
            client_reference_id: order.id,
            metadata: { orderId: order.id },
            payment_intent_data: { metadata: { orderId: order.id } },
        });

        await db.orders.update(order.id, { stripeSessionId: session.id });

        return NextResponse.json({ redirect: session.url });
    } catch (err) {
        console.error("Checkout failed:", err);
        return NextResponse.json({
            success: false,
            message: t("messages.server-error"),
        });
    }
};
