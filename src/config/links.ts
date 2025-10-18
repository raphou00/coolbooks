import { useTranslations } from "next-intl";
import {
    Lock,
    Settings2,
    Coins,
    Home,
    BookHeart,
    Palette,
    Compass,
} from "lucide-react";

export const useGetLinks = () => {
    const t = useTranslations("links");
    return [
        {
            title: t("my-books"),
            path: "/",
            icon: BookHeart,
        },
        {
            title: t("studio"),
            path: "/studio",
            icon: Palette,
        },
        {
            title: t("explore"),
            path: "/explore",
            icon: Compass,
        },
    ];
};

export const useGetSorts = () => {
    const t = useTranslations("links");
    return [
        {
            title: t("latest"),
            path: "latest",
        },
        {
            title: t("oldest"),
            path: "oldest",
        },
        {
            title: t("popular"),
            path: "popular",
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
            title: "Cool Books",
            links: [
                {
                    title: t("my-books"),
                    path: "/",
                    icon: BookHeart,
                },
                {
                    title: t("pricing"),
                    path: "/pricing",
                },
                {
                    title: t("account"),
                    path: "/account/profile",
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
            path: "https://instagram.com/",
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
