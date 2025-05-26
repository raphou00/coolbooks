"use client";

import Title from "@/components/ui/title";
import { cn, formatAmountForDisplay } from "@/lib/utils";
import { useTranslations } from "next-intl";
import axios from "axios";
import toast from "react-hot-toast";
import type { getTiers } from "@/lib/stripe";
import { motion } from "framer-motion";
import type { User } from "lucia";

type Tiers = Awaited<ReturnType<typeof getTiers>>;

type PricingProps = {
    tiers: Tiers;
    user: User | null;
};

const Pricing: React.FC<PricingProps> = ({ tiers, user }) => {
    const t = useTranslations("pages.pricing");

    const submit = async (priceId: string) => {
        if (user?.stripeCustomerId) await createCheckout(priceId);
        else await openPortal();
    };

    const createCheckout = async (priceId: string) => {
        const res = await axios.get(
            "/api/stripe/create-checkout?priceId=" + priceId,
            {
                method: "POST",
            }
        );
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
                {tiers.map((tier) => (
                    <motion.div
                        key={tier.name}
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
                            "relative h-96 w-80 shrink-0 overflow-hidden rounded-xl p-8 bg-pink-600 bg-indigo-600",
                            tier.color
                        )}
                    >
                        <div className="relative z-10 text-white">
                            <span className="mb-3 block w-fit rounded-full bg-white/30 px-3 py-0.5 text-sm font-light text-white">
                                {tier.name}
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
                                {formatAmountForDisplay(tier.price)}/
                                <br />
                                {t("month")}
                            </motion.span>
                            <div>
                                <p className="mt- text-base/7">
                                    {tier.description}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => submit(tier.priceId)}
                            className={cn(
                                "absolute bottom-4 left-4 right-4 z-20 btn border-2 border-white bg-white/30"
                            )}
                        >
                            {t("get-started")}
                        </button>
                    </motion.div>
                ))}
            </div>
        </>
    );
};

export default Pricing;
