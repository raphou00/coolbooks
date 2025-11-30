"use client";

import { useTranslations } from "next-intl";
import type { User } from "lucia";
import { CheckIcon } from "lucide-react";
import type { getSubscription } from "@/lib/stripe";
import { cn, formatAmountForDisplay, requestAPI } from "@/lib/utils";
import Title from "@/components/ui/title";

type Subscriptions = Awaited<ReturnType<typeof getSubscription>>;

type PricingProps = {
    subs: Subscriptions;
    user: User | null;
};

const Pricing: React.FC<PricingProps> = ({ subs, user }) => {
    const t = useTranslations("pages.pricing");

    const submit = async (priceId: string) => {
        if (!user?.stripeCustomerId) await createCheckout(priceId);
        else await openPortal();
    };

    const createCheckout = async (priceId: string) => {
        await requestAPI(
            "GET",
            `/api/stripe/create-checkout?priceId=${priceId}`
        );
    };

    const openPortal = async () => {
        await requestAPI("GET", "/api/stripe/portal");
    };

    return (
        <div className="">
            <div className="mx-auto max-w-4xl text-center mb-6">
                <Title
                    text={t("title")}
                    className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 w-min mx-auto"
                    underline
                />
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-center text-xl font-medium text-pretty">
                {t("description")}
            </p>

            <div className="isolate mx-auto mt-8 grid max-w-md grid-cols-1 gap-x-8 gap-y-8 sm:mt-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                {subs.map((tier, _) => {
                    const original = tier.price * 1.2;

                    return (
                        <div
                            key={tier.name}
                            className={cn(
                                "flex flex-col justify-between2 rounded-3xl bg-base-100/50 p-8 inset-ring inset-ring-neutral xl:p-8",
                                tier.popular && "scale-110"
                            )}
                        >
                            <div>
                                <div className="flex items-center justify-between gap-x-4">
                                    <Title
                                        className={cn(
                                            tier.popular ? "text-primary" : (
                                                "text-base-content"
                                            ),
                                            "text-2xl"
                                        )}
                                        text={tier.name}
                                    />
                                    {tier.popular ?
                                        <p className="rounded-full px-3 py-1 bg-secondary/20 text-secondary">
                                            {t("popular")}
                                        </p>
                                    :   null}
                                </div>

                                <p className="mt-4 text-sm/6">
                                    {tier.description}
                                </p>

                                <div className="mt-6">
                                    <div className="flex items-center justify-center gap-2 sm:justify-start">
                                        <span className="font-semibold text-red-600 line-through">
                                            {formatAmountForDisplay(original)}
                                        </span>
                                        <span className="text-sm uppercase tracking-wide text-red-600/90">
                                            {t("on-sale")}
                                        </span>
                                    </div>

                                    <p className="mt-1 flex items-baseline justify-center gap-x-1 sm:justify-start">
                                        <span className="text-5xl font-semibold tracking-tight">
                                            {formatAmountForDisplay(tier.price)}
                                        </span>
                                        <span className="text-sm/6 font-semibold">
                                            {t("month")}
                                        </span>
                                    </p>
                                </div>

                                <ul
                                    role="list"
                                    className="mt-8 space-y-3 text-sm/6"
                                >
                                    {tier.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex gap-x-3"
                                        >
                                            <CheckIcon
                                                aria-hidden="true"
                                                className="h-6 w-5 flex-none text-primary"
                                            />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => submit(tier.priceId)}
                                className={cn(
                                    "btn btn-lg mt-4",
                                    tier.popular ? "btn-primary" : "btn-outline"
                                )}
                            >
                                {user?.stripeCustomerId ?
                                    t("portal")
                                :   t("subscribe")}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Pricing;
