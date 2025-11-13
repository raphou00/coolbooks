import { defineRouting } from "next-intl/routing";

export const localesTitle = {
    en: "English",
    fr: "Français",
    de: "Deutsch",
    es: "Español",
    pt: "Português",
    it: "Italiano",
};

export const routing = defineRouting({
    locales: ["en", "fr", "de", "es", "pt", "it"],
    defaultLocale: "en",
    localePrefix: {
        mode: "never",
    },
});
