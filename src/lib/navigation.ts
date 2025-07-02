import { defineRouting } from "next-intl/routing";

export const localesTitle = {
    en: "English",
    fr: "Français",
    de: "Deutsch",
};

export const routing = defineRouting({
    locales: ["en", "fr", "de"],
    defaultLocale: "en",
    localePrefix: {
        mode: "never",
    },
});
