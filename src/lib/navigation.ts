import { createSharedPathnamesNavigation } from "next-intl/navigation";

export const localesTitle = {
    en: "English",
};

export const locales = ["en"];

export const defaultLocale = "en";

export const localePrefix = "never";

export const { Link, redirect, usePathname, useRouter } =
    createSharedPathnamesNavigation({
        locales,
        localePrefix,
        defaultLocale,
    });
