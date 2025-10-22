"use client";

import Title from "@/components/ui/title";
import { cn, formatAmountForDisplay } from "@/lib/utils";
import { useTranslations } from "next-intl";
import axios from "axios";
import toast from "react-hot-toast";
import type { getSubscription } from "@/lib/stripe";
import type { User } from "lucia";
import { CheckIcon } from "lucide-react";

type Subscription = Awaited<ReturnType<typeof getSubscription>>;

type PricingProps = {
    sub: Subscription;
    user: User | null;
};

const tiers = [
    {
        name: "Basic",
        id: "tier-basic",
        price: 10,
        description: "Cool",
        features: [
            "5 AI book creation",
            "Standard illustrations",
            "Basic customization",
        ],
        popular: false,
    },
    {
        name: "Family",
        id: "tier-family",
        price: 18,
        description: "Very cool",
        features: [
            "15 AI books creation",
            "Premium illustrations",
            "Better personalization",
        ],
        popular: true,
    },
    {
        name: "Premium",
        id: "tier-premium",
        price: 30,
        description: "Very cool",
        features: [
            "Unlimited AI books creation",
            "All premium features",
            "Priority generation (faster processing)",
        ],
        popular: false,
    },
];

const Pricing: React.FC<PricingProps> = ({ sub, user }) => {
    const t = useTranslations("pages.pricing");

    const submit = async () => {
        if (!user?.stripeCustomerId) await createCheckout();
        else await openPortal();
    };

    const createCheckout = async () => {
        const res = await axios.get("/api/stripe/create-checkout", {
            method: "POST",
        });
        if (!res.data.success) toast.error(res.data.message);
        else window.location.replace(res.data.redirect);
    };

    const openPortal = async () => {
        const res = await axios.get("/api/stripe/portal");
        if (!res.data.success) toast.error(res.data.message);
        else window.location.replace(res.data.redirect);
    };

    return (
        <div className="">
            <div className="mx-auto max-w-4xl text-center">
                <Title
                    text={t("title")}
                    className="text-6xl mx-auto w-fit text-center"
                    underline
                />
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-pretty">
                {t("description")}
            </p>
            <div className="isolate mx-auto mt- grid max-w-md grid-cols-1 gap-y-8 sm:mt-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                {tiers.map((tier, tierIdx) => (
                    <div
                        key={tier.id}
                        className={cn(
                            tier.popular ?
                                "lg:z-10 lg:rounded-b-none"
                            :   "lg:mt-8",
                            tierIdx === 0 ? "-mr-px lg:rounded-r-none" : "",
                            tierIdx === tiers.length - 1 ?
                                "-ml-px lg:rounded-l-none"
                            :   "",
                            "flex flex-col justify-between rounded-3xl bg-white p-8 inset-ring inset-ring-gray-200 xl:p-10"
                        )}
                    >
                        <div>
                            <div className="flex items-center justify-between gap-x-4">
                                <h3
                                    id={tier.id}
                                    className={cn(
                                        tier.popular ? "text-primary" : (
                                            "text-base-content"
                                        ),
                                        "text-lg/8 font-semibold"
                                    )}
                                >
                                    {tier.name}
                                </h3>
                                {tier.popular ?
                                    <p className="rounded-full px-2.5 py-1 text-xs/5 font-semibold bg-secondary/40 text-secondary">
                                        {t("popular")}
                                    </p>
                                :   null}
                            </div>
                            <p className="mt-4 text-sm/6">{tier.description}</p>
                            <p className="mt-6 flex items-baseline gap-x-1">
                                <span className="text-4xl font-semibold tracking-tight">
                                    {formatAmountForDisplay(tier.price)}
                                </span>
                                <span className="text-sm/6 font-semibold">
                                    {t("month")}
                                </span>
                            </p>
                            <ul
                                role="list"
                                className="mt-8 space-y-3 text-sm/6"
                            >
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex gap-x-3">
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
                            onClick={() => submit()}
                            className={cn(
                                "btn mt-4",
                                tier.popular ? "btn-primary" : "btn-outline"
                            )}
                        >
                            {user?.stripeCustomerId ?
                                t("portal")
                            :   t("subscribe")}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Pricing;
