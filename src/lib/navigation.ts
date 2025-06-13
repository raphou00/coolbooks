import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const localesTitle = {
    en: "English",
    fr: "Français",
    de: "Deutsch",
    es: "Español",
    pt: "Português",
    it: "Italiano",
    ja: "日本語",
    ko: "한국어",
};

export const locales = ["en", "fr", "de", "es", "pt", "it", "ja", "ko"];

export const defaultLocale = "en";

export const localePrefix = "never";

export const { Link, redirect, usePathname, useRouter } =
    createSharedPathnamesNavigation({
        locales,
        localePrefix,
        defaultLocale,
    });
