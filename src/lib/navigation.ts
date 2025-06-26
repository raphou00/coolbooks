import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const localesTitle = {
    en: "English",
    fr: "Français",
    de: "Deutsch",
};

export const locales = ["en", "fr", "de"];

export const defaultLocale = "en";

export const localePrefix = "never";

export const { Link, redirect, usePathname, useRouter } =
    createSharedPathnamesNavigation({
        locales,
        localePrefix,
        defaultLocale,
    });
