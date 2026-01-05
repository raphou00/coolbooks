import { useTranslations } from "next-intl";

export const useGetLinks = () => {
    const t = useTranslations("links");
    return [
        {
            title: t("home"),
            path: "/",
        },
        {
            title: t("examples"),
            path: "/#examples",
        },
        {
            title: t("create-book"),
            path: "/#create-book",
        },
        {
            title: t("how-it-works"),
            path: "/#how-it-works",
        },
        {
            title: t("features"),
            path: "/#features",
        },
    ];
};

export const useGetFooterLinks = () => {
    const t = useTranslations("links");
    return [
        {
            title: t("contact"),
            path: "/contact",
        },
        {
            title: t("privacy"),
            path: "/privacy",
        },
        {
            title: t("terms"),
            path: "/terms",
        },
        {
            title: t("refund"),
            path: "/refund",
        },
    ];
};
