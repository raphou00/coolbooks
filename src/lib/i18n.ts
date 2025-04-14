import { redirect } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales } from "@/lib/navigation";
import type { IntlMessages } from "../../globals";

const config = getRequestConfig(async ({ locale }) => {
    if (!locales.includes(locale)) redirect(`/${defaultLocale}`);

    const messages: IntlMessages = (await import(`/locales/${locale}.json`))
        .default;

    return { messages };
});

export default config;
