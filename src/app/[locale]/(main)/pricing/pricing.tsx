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
        name: "Basic",
        id: "tier-basic",
        price: 8,
        description: "Cool",
        features: ["1 AI book creation", "Access to explore page"],
        popular: false,
    },
    {
        name: "Family",
        id: "tier-family",
        price: 12,
        description: "Very cool",
        features: [
            "3 AI books creation",
            "Unlimited manual books creation",
            "Access to explore page",
        ],
        popular: true,
    },
    {
        name: "Premium",
        id: "tier-premium",
        price: 20,
        description: "Very cool",
        features: [
            "3 AI books creation",
            "Unlimited manual books creation",
            "Access to explore page",
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
                    className="text-5xl mx-auto w-fit text-center"
                    underline
                />
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-pretty">
                {t("description")}
            </p>
            <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
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
                                        tier.popular ? "text-indigo-600" : (
                                            "text-gray-900"
                                        ),
                                        "text-lg/8 font-semibold"
                                    )}
                                >
                                    {tier.name}
                                </h3>
                                {tier.popular ?
                                    <p className="rounded-full bg-indigo-600/10 px-2.5 py-1 text-xs/5 font-semibold text-indigo-600">
                                        Most popular
                                    </p>
                                :   null}
                            </div>
                            <p className="mt-4 text-sm/6 text-gray-600">
                                {tier.description}
                            </p>
                            <p className="mt-6 flex items-baseline gap-x-1">
                                <span className="text-4xl font-semibold tracking-tight text-gray-900">
                                    {tier.price}
                                </span>
                                <span className="text-sm/6 font-semibold text-gray-600">
                                    /month
                                </span>
                            </p>
                            <ul
                                role="list"
                                className="mt-8 space-y-3 text-sm/6 text-gray-600"
                            >
                                {tier.features.map((feature) => (
                                    <li key={feature} className="flex gap-x-3">
                                        <CheckIcon
                                            aria-hidden="true"
                                            className="h-6 w-5 flex-none text-indigo-600"
                                        />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <a
                            aria-describedby={tier.id}
                            className={cn(
                                tier.popular ?
                                    "bg-indigo-600 text-white shadow-xs hover:bg-indigo-500"
                                :   "text-indigo-600 inset-ring inset-ring-indigo-200 hover:inset-ring-indigo-300",
                                "mt-8 block rounded-md px-3 py-2 text-center text-sm/6 font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            )}
                        >
                            Buy plan
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Pricing;
