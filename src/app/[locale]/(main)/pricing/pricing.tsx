"use client";

import Title from "@/components/ui/title";
import { cn, formatAmountForDisplay } from "@/lib/utils";
import { useTranslations } from "next-intl";
import axios from "axios";
import toast from "react-hot-toast";
import type { getSubscription } from "@/lib/stripe";
import { motion } from "framer-motion";
import type { User } from "lucia";
import { CheckIcon } from "lucide-react";

type Subscription = Awaited<ReturnType<typeof getSubscription>>;

type PricingProps = {
    sub: Subscription;
    user: User | null;
};

const _Pricing: React.FC<PricingProps> = ({ sub, user }) => {
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
        <>
            <div className="mx-auto max-w-4xl text-center">
                <Title
                    text={t("title")}
                    className="text-5xl mx-auto w-fit text-center"
                    underline
                />
                <p className="mt-4 text-lg max-w-md mx-auto">
                    {t("description", {
                        price: formatAmountForDisplay(sub.price),
                    })}
                </p>
            </div>
            <div className="mx-auto my-8 flex justify-center flex-wrap gap-6">
                <motion.div
                    whileHover="hover"
                    transition={{
                        duration: 1,
                        ease: "backInOut",
                    }}
                    variants={{
                        hover: {
                            scale: 1.05,
                        },
                    }}
                    className={cn(
                        "relative h-96 w-full max-w-md shrink-0 overflow-hidden rounded-xl p-8 bg-indigo-600"
                    )}
                >
                    <div className="relative z-10 text-white">
                        <span className="mb-3 block w-fit rounded-full bg-white/30 px-3 py-0.5 text-sm font-light text-white">
                            {sub.name}
                        </span>
                        <motion.span
                            initial={{ scale: 0.85 }}
                            variants={{
                                hover: {
                                    scale: 1,
                                },
                            }}
                            transition={{
                                duration: 1,
                                ease: "backInOut",
                            }}
                            className="my-2 block origin-top-left font-mono text-6xl font-black"
                        >
                            {formatAmountForDisplay(sub.price)}/
                            <br />
                            {t("month")}
                        </motion.span>
                        <div>
                            <p className="mt-4 text-base/7">
                                {sub.description}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => submit()}
                        className={cn(
                            "absolute bottom-4 left-4 right-4 z-20 btn border-2 border-white bg-white/30"
                        )}
                    >
                        {user?.stripeCustomerId ? t("portal") : t("subscribe")}
                    </button>
                </motion.div>
            </div>
        </>
    );
};

const tiers = [
    {
        name: "Freelancer",
        id: "tier-freelancer",
        price: 5,
        description: "Cool",
        features: ["1 AI book creation", "Access to explore page"],
        featured: false,
    },
    {
        name: "Startup",
        id: "tier-startup",
        price: 8,
        description: "Very cool",
        features: [
            "3 AI books creation",
            "Unlimited manual books creation",
            "Access to explore page",
        ],
        featured: true,
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
                    className="text-5xl mx-auto w-fit text-center"
                    underline
                />
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-pretty">
                {t("description")}
            </p>
            <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
                {tiers.map((tier, tierIdx) => (
                    <div
                        key={tier.id}
                        className={cn(
                            tier.featured ?
                                "relative bg-gray-900 shadow-2xl"
                            :   "bg-white/60 sm:mx-8 lg:mx-0",
                            tier.featured ? ""
                            : tierIdx === 0 ?
                                "rounded-t-3xl sm:rounded-b-none lg:rounded-tr-none lg:rounded-bl-3xl"
                            :   "sm:rounded-t-none lg:rounded-tr-3xl lg:rounded-bl-none",
                            "rounded-3xl p-8 ring-1 ring-gray-900/10 sm:p-10"
                        )}
                    >
                        <h3
                            id={tier.id}
                            className={cn(
                                tier.featured ? "text-indigo-400" : (
                                    "text-indigo-600"
                                ),
                                "text-base/7 font-semibold"
                            )}
                        >
                            {tier.name}
                        </h3>
                        <p className="mt-4 flex items-baseline gap-x-2">
                            <span
                                className={cn(
                                    tier.featured ? "text-white" : (
                                        "text-gray-900"
                                    ),
                                    "text-5xl font-semibold tracking-tight"
                                )}
                            >
                                {formatAmountForDisplay(tier.price)}
                            </span>
                            <span
                                className={cn(
                                    tier.featured ? "text-gray-400" : (
                                        "text-gray-500"
                                    ),
                                    "text-base"
                                )}
                            >
                                {t("month")}
                            </span>
                        </p>
                        <p
                            className={cn(
                                tier.featured ? "text-gray-300" : (
                                    "text-gray-600"
                                ),
                                "mt-6 text-base/7"
                            )}
                        >
                            {tier.description}
                        </p>
                        <ul
                            role="list"
                            className={cn(
                                tier.featured ? "text-gray-300" : (
                                    "text-gray-600"
                                ),
                                "mt-8 space-y-3 text-sm/6 sm:mt-10"
                            )}
                        >
                            {tier.features.map((feature) => (
                                <li key={feature} className="flex gap-x-3">
                                    <CheckIcon
                                        aria-hidden="true"
                                        className={cn(
                                            tier.featured ? "text-indigo-400"
                                            :   "text-indigo-600",
                                            "h-6 w-5 flex-none"
                                        )}
                                    />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <button
                            onClick={() => submit()}
                            className={cn(
                                "btn w-full mt-3",
                                tier.featured ? "btn-secondary" : "btn-outline"
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
