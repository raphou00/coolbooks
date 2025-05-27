"use client";

import Title from "@/components/ui/title";
import { cn, formatAmountForDisplay } from "@/lib/utils";
import { useTranslations } from "next-intl";
import axios from "axios";
import toast from "react-hot-toast";
import type { getSubscription } from "@/lib/stripe";
import { motion } from "framer-motion";
import type { User } from "lucia";

type Subscription = Awaited<ReturnType<typeof getSubscription>>;

type PricingProps = {
    sub: Subscription;
    user: User | null;
};

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
        <>
            <div className="mx-auto max-w-4xl text-center">
                <Title
                    text={t("title")}
                    className="text-5xl mx-auto w-fit text-center"
                    underline
                />
                <p className="mt-4 text-lg">{t("description")}</p>
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
                            <p className="mt- text-base/7">{sub.description}</p>
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
                    <Background />
                </motion.div>
            </div>
        </>
    );
};

const Background: React.FC = () => {
    return (
        <motion.svg
            width="320"
            height="384"
            viewBox="0 0 320 384"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="absolute inset-0 z-0 mx-auto"
            variants={{
                hover: {
                    scale: 1.5,
                },
            }}
            transition={{
                duration: 1,
                ease: "backInOut",
            }}
        >
            <motion.circle
                variants={{
                    hover: {
                        scaleY: 0.5,
                        y: -25,
                    },
                }}
                transition={{
                    duration: 1,
                    ease: "backInOut",
                    delay: 0.2,
                }}
                cx="160.5"
                cy="114.5"
                r="101.5"
                fill="#262626"
            />
            <motion.ellipse
                variants={{
                    hover: {
                        scaleY: 2.25,
                        y: -25,
                    },
                }}
                transition={{
                    duration: 1,
                    ease: "backInOut",
                    delay: 0.2,
                }}
                cx="160.5"
                cy="265.5"
                rx="101.5"
                ry="43.5"
                fill="#262626"
            />
        </motion.svg>
    );
};

export default Pricing;
