"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { User } from "lucia";
import axios from "axios";
import toast from "react-hot-toast";
import { CreditCard, Zap } from "lucide-react";
import {
    productIdBasic,
    productIdFamily,
    productIdPremium,
} from "@/config/stripe";

type BillingProps = {
    user: User;
};

export const Billing: React.FC<BillingProps> = ({ user }) => {
    const t = useTranslations("pages.account-billing");

    const openPortal = async () => {
        const res = await axios.get("/api/stripe/portal");
        if (!res.data.success) toast.error(res.data.message);
        else window.location.href = res.data.redirect;
    };

    const getSubscriptionName = (productId: string | undefined) => {
        if (!productId) return t("free");

        switch (productId) {
            case productIdBasic:
                return t("basic");
            case productIdFamily:
                return t("family");
            case productIdPremium:
                return t("premium");
        }
    };
    const hasActiveSubscription =
        user.subscriptionStatus === "active" ||
        user.subscriptionStatus === "trialing";

    return (
        <div className="">
            <div className="flex items-center gap-3 mb-6">
                {user.subscriptionStatus === "active" && (
                    <span className="flex size-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full size-3 bg-primary"></span>
                    </span>
                )}
                {user.subscriptionStatus === "trialing" && (
                    <span className="flex size-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                        <span className="relative inline-flex rounded-full size-3 bg-secondary"></span>
                    </span>
                )}
                {user.subscriptionStatus === "past_due" && (
                    <span className="size-3 rounded-full bg-error"></span>
                )}
                {(!user.subscriptionStatus ||
                    user.subscriptionStatus === "canceled") && (
                    <span className="size-3 rounded-full bg-error"></span>
                )}

                <h2 className="text-2xl font-bold">
                    {getSubscriptionName(user?.stripeProductId)} {t("plan")}
                </h2>
            </div>

            <div className="mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-xl border-2 border-primary/20">
                    <Zap className="w-5 h-5" />
                    {user.credits} {t("credits")}
                </div>
            </div>

            {user.subscriptionStatus === "past_due" && (
                <div className="mb-6 p-4 bg-destructive/10 border-2 border-destructive/20 rounded-xl">
                    <p className="text-destructive font-semibold text-sm">
                        {t("payment-failed")}
                    </p>
                </div>
            )}

            {user.subscriptionStatus === "trialing" && (
                <div className="mb-6 p-4 bg-secondary/10 border-2 border-secondary/20 rounded-xl">
                    <p className="text-secondary font-semibold text-sm">
                        {t("free-trial")}
                    </p>
                </div>
            )}

            {hasActiveSubscription ?
                <button
                    onClick={openPortal}
                    className="btn btn-primary btn-lg w-full"
                >
                    <CreditCard className="size-6" />
                    {t("manage")}
                </button>
            :   <Link
                    href="/pricing"
                    className="block w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-semibold text-center"
                >
                    {t("upgrade")}
                </Link>
            }

            {hasActiveSubscription && (
                <p className="text-sm text-muted-foreground text-center mt-8">
                    {t("manage-tip")}
                </p>
            )}
        </div>
    );
};
