import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const localesTitle = {
    en: "English",
    fr: "Français",
    de: "Deutsch",
    es: "Español",
    ja: "日本語",
};

export const locales = ["en", "fr", "de", "es", "ja"];

export const defaultLocale = "en";

export const localePrefix = "never";

export const { Link, redirect, usePathname, useRouter } =
    createSharedPathnamesNavigation({
        locales,
        localePrefix,
        defaultLocale,
    });
