import { type NextRequest, NextResponse } from "next/server";
import { getTranslations } from "next-intl/server";
import { OpenAI } from "openai";
import { stripe } from "@/lib/stripe";
import env from "@/lib/env";
import type { Locale } from "@/lib/types";
import { checkRateLimit, ratelimitPost } from "@/lib/rate-limiter";
import { formatAmountForStripe } from "@/lib/utils";
import { currency, price } from "@/config/stripe";
import bookSchema, { type BookSchema } from "@/schema/book";
import { getUser } from "@/lib/auth";

const openai = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
});

export const POST = async (req: NextRequest) => {
    const locale = req.cookies.get("NEXT_LOCALE")?.value || ("en" as Locale);
    const t = await getTranslations({
        locale,
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

        const body = (await req.json()) as BookSchema;

        const { error } = bookSchema(t).safeParse(body);

        if (error) {
            return NextResponse.json({
                success: false,
                errors: error.flatten().fieldErrors,
            });
        }

        const moderation = await openai.moderations.create({
            model: "omni-moderation-latest",
            input: body.childName + " " + body.prompt,
        });

        if (moderation.results[0].flagged) {
            return NextResponse.json({
                success: false,
                message: t("messages.prompt-inappropriate"),
            });
        }

        const metadata = {
            userId: user?.user?.id || null,
            ...body,
        };

        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price_data: {
                        product_data: {
                            name: "Create Your Own Personalized Book",
                        },
                        currency: currency,
                        unit_amount: formatAmountForStripe(price),
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${env.APP_URL}/?payment_success=true`,
            cancel_url: `${env.APP_URL}/?payment_success=false`,
            locale: locale as Locale,
            customer: user?.user?.stripeCustomerId || undefined,
            client_reference_id: user?.user?.id || undefined,
            metadata,
        });

        return NextResponse.json({
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
