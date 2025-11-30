"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { User } from "lucia";
import { Coins, CreditCard } from "lucide-react";
import {
    productIdBasic,
    productIdFamily,
    productIdPremium,
} from "@/config/stripe";
import Title from "@/components/ui/title";
import { requestAPI } from "@/lib/utils";

type BillingProps = {
    user: User;
};

export const Billing: React.FC<BillingProps> = ({ user }) => {
    const t = useTranslations("pages.account-billing");

    const openPortal = async () => {
        await requestAPI("GET", "/api/stripe/portal");
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
            default:
                return t("free");
        }
    };
    const hasActiveSubscription =
        user.subscriptionStatus === "active" ||
        user.subscriptionStatus === "trialing";

    return (
        <>
            <div className="flex justify-between">
                <div className="flex items-center gap-3 mb-6">
                    {user.subscriptionStatus === "active" && (
                        <span className="flex size-4 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                            <span className="relative inline-flex rounded-full size-4 bg-success"></span>
                        </span>
                    )}
                    {user.subscriptionStatus === "past_due" && (
                        <span className="size-4 rounded-full bg-error"></span>
                    )}
                    {(!user.subscriptionStatus ||
                        user.subscriptionStatus === "canceled") && (
                        <span className="size-4 rounded-full bg-error"></span>
                    )}
                    <Title
                        text={t("plan", {
                            plan: getSubscriptionName(user?.stripeProductId),
                        })}
                        className="text-3xl w-fit"
                    />
                </div>

                <div className="mb-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-2xl border-2 border-secondary/20 text-lg">
                        <Coins className="size-6 text-secondary" />
                        <span className="font-bold">{user.credits}</span>
                        {t("credits")}
                    </div>
                </div>
            </div>

            {user.subscriptionStatus === "past_due" && (
                <div className="mb-6 p-4 bg-warning/10 border-2 border-warning/20 rounded-xl">
                    <p className="font-semibold text-sm">
                        {t("payment-failed")}
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
            :   <Link href="/pricing" className="btn btn-primary btn-lg w-full">
                    {t("upgrade")}
                </Link>
            }

            {hasActiveSubscription && (
                <p className="text-sm text-muted-foreground text-center mt-8">
                    {t("manage-tip")}
                </p>
            )}
        </>
    );
};
