import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { locales } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import env from "@/lib/env";
import * as metadata from "@/config/seo";
import RootProviders from "./providers";
import "@/styles/globals.css";

const poppins = Poppins({
    subsets: ["latin"],
    weight: ["500"],
});

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("common");
    return {
        title: {
            default: metadata.title,
            template: `%s ${String.fromCharCode(183)} ${metadata.title}`,
        },
        description: t("description"),
        abstract: t("description"),
        keywords: metadata.keywords,
        applicationName: metadata.title,
        category: metadata.category,
        classification: metadata.category,
        metadataBase: new URL(env.APP_URL),
        referrer: "origin",
        openGraph: {
            title: metadata.title,
            siteName: metadata.title,
            description: t("description"),
            images: [
                {
                    url: "/images/share-image.jpeg",
                },
            ],
        },
        alternates: {
            canonical: "/",
            languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
        },
    };
};

const Root = async ({ children }: React.PropsWithChildren) => {
    const locale = await getLocale();
    const messages = await getMessages({ locale });

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className={cn("bg-base-100", poppins.className)}>
                <RootProviders>
                    <NextIntlClientProvider messages={messages}>
                        {children}
                    </NextIntlClientProvider>
                </RootProviders>
            </body>
        </html>
    );
};

export { generateMetadata };
export default Root;
