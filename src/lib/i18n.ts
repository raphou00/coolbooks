import { redirect } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales } from "@/lib/navigation";

const config = getRequestConfig(async ({ locale }) => {
    if (!locales.includes(locale)) redirect(`/${defaultLocale}`);

    const messages = (await import(`/locales/${locale}.json`)).default;

    return { messages };
});

export default config;
