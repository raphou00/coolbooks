"use client";

import Title from "@/components/ui/title";
import { Link } from "@/lib/navigation";
import { cn, formatAmountForDisplay } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import type { TranslationsFunc } from "@/lib/types";

const getTiers = (t: TranslationsFunc) => {
    const tiers = [
        {
            name: t("tiers.crush.title"),
            id: "tier-crush",
            href: "#",
            priceMonthly: 5,
            description: t("tiers.crush.description"),
            features: [
                t("tiers.crush.features.1"),
                t("tiers.crush.features.2"),
            ],
            featured: false,
        },
        {
            name: t("tiers.lover.title"),
            id: "tier-lover",
            href: "#",
            priceMonthly: 8,
            description: t("tiers.lover.description"),
            features: [
                t("tiers.lover.features.1"),
                t("tiers.lover.features.2"),
                t("tiers.lover.features.3"),
            ],
            featured: true,
        },
    ];

    return tiers;
};

const Pricing: React.FC = () => {
    const t = useTranslations("pages.pricing");
    const tiers = getTiers(t);
    return (
        <>
            <div className="mx-auto max-w-4xl text-center">
                <Title
                    text={t("title")}
                    className="text-5xl mx-auto w-fit text-center"
                    underline
                />
                <p className="mt-4 text-lg">{t("description")}</p>
            </div>
            <div className="mx-auto my-8 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
                {tiers.map((tier, tierIdx) => (
                    <div
                        key={tier.id}
                        className={cn(
                            tier.featured ?
                                "relative bg-secondary/20 shadow-2xl"
                            :   "bg-base-200 sm:mx-8 lg:mx-0",
                            tier.featured ? ""
                            : tierIdx === 0 ?
                                "rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl"
                            :   "sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none",
                            "rounded-2xl p-8 ring-1 ring-gray-900/10 sm:p-10"
                        )}
                    >
                        <h3
                            id={tier.id}
                            className="text-secondary text-base/7 font-semibold"
                        >
                            {tier.name}
                        </h3>
                        <p className="mt-4 flex items-baseline gap-x-2">
                            <span className="text-5xl font-semibold tracking-tight">
                                {formatAmountForDisplay(tier.priceMonthly)}
                            </span>
                            <span className="text-neutral text-base">
                                /{t("month")}
                            </span>
                        </p>
                        <p className="mt-6 text-base/7">{tier.description}</p>
                        <ul
                            role="list"
                            className="mt-8 space-y-3 text-sm/6 sm:mt-10"
                        >
                            {tier.features.map((feature) => (
                                <li key={feature} className="flex gap-x-3">
                                    <CheckIcon
                                        aria-hidden="true"
                                        className="text-primary h-6 w-5 flex-none"
                                    />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Link
                            href={tier.href}
                            aria-describedby={tier.id}
                            className={cn(
                                tier.featured ?
                                    "btn-secondary btn-outline"
                                :   "btn-secondary",
                                "mt-8 btn w-full"
                            )}
                        >
                            {t("get-started")}
                        </Link>
                    </div>
                ))}
            </div>
        </>
    );
};

export default Pricing;
