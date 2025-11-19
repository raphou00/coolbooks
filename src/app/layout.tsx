import type { Metadata } from "next";
import Script from "next/script";
import { Poppins } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/lib/navigation";
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
            type: "website",
            title: metadata.title,
            siteName: metadata.title,
            description: t("description"),
            images: [
                {
                    url: "/images/og.jpg",
                },
            ],
        },
        alternates: {
            canonical: "/",
            languages: Object.fromEntries(
                routing.locales.map((l) => [l, `/${l}`])
            ),
        },
    };
};

const Root = async ({ children }: React.PropsWithChildren) => {
    const locale = await getLocale();
    const messages = await getMessages({ locale });

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <Script id="meta-pixel" strategy="lazyOnload">
                    {`
                    <!-- Meta Pixel Code -->
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version=‘2.0’;
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,’script’,
                    ‘https://connect.facebook.net/en_US/fbevents.js’);
                    fbq(‘init’, ‘1231692028783203’);
                    fbq(‘track’, ‘PageView’);
                    <!— End Meta Pixel Code —>
                    `}
                </Script>
            </head>
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
