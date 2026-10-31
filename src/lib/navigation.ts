import { defineRouting } from "next-intl/routing";

/** Swiss launch: the three main national languages, plus English. */
export const localesTitle = {
    de: "Deutsch",
    fr: "Français",
    it: "Italiano",
    en: "English",
};

export const routing = defineRouting({
    locales: ["de", "fr", "it", "en"],
    defaultLocale: "de",
    localePrefix: {
        mode: "never",
    },
});
