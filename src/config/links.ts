import { useTranslations } from "next-intl";
import {
    Lock,
    Settings2,
    Coins,
    Compass,
    Gift,
    MessageCircleHeart,
} from "lucide-react";

export const useGetLinks = () => {
    const t = useTranslations("links");
    return [
        {
            title: t("explore"),
            path: "/",
            icon: Compass,
        },
        {
            title: t("gift"),
            path: "/gift",
            icon: Gift,
        },
        {
            title: t("chat"),
            path: "/chat",
            icon: MessageCircleHeart,
        },
    ];
};

export const useGetAccountLinks = () => {
    const t = useTranslations("links");
    return [
        {
            title: t("profile"),
            path: "/account/profile",
            icon: Settings2,
        },
        {
            title: t("password"),
            path: "/account/password",
            icon: Lock,
        },
        {
            title: t("sessions"),
            path: "/account/sessions",
            icon: Lock,
        },
        {
            title: t("socials"),
            path: "/account/socials",
            icon: Coins,
        },
        {
            title: t("delete-account"),
            path: "/account/delete",
            icon: Lock,
        },
    ];
};

export const useGetFooterLinks = () => {
    const t = useTranslations("links");
    return [
        {
            title: "pinksea",
            links: [
                {
                    title: t("home"),
                    path: "/",
                },
            ],
        },
        {
            title: t("legal"),
            links: [
                {
                    title: t("privacy"),
                    path: "/privacy",
                },
                {
                    title: t("terms"),
                    path: "/terms",
                },
                {
                    title: t("contact"),
                    path: "/contact",
                },
            ],
        },
    ];
};

export const useGetSocialLinks = () => {
    return [
        {
            title: "Instagram",
            path: "https://instagram.com/pinksea.of",
            icon: Coins,
        },
    ];
};

export const useGetCardsLinks = () => {
    return [
        {
            title: "Visa",
            icon: "/images/cards/visa.svg",
        },
        {
            title: "MasterCard",
            icon: "/images/cards/mastercard.svg",
        },
        {
            title: "JCB",
            icon: "/images/cards/jcb.svg",
        },
        {
            title: "Diners Club",
            icon: "/images/cards/diners.svg",
        },
        {
            title: "American Express",
            icon: "/images/cards/amex.svg",
        },
    ];
};
