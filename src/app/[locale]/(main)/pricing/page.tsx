import { type Metadata } from "next";
import Main from "@/components/layout/main";
import { getTranslations } from "next-intl/server";
import Pricing from "./pricing";
import { getSubscription } from "@/lib/stripe";
import { getUser } from "@/lib/auth";
import Script from "next/script";
import Head from "next/head";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations();
    return {
        title: t("pages.pricing.title"),
        description: t("pages.pricing.description"),
    };
};

const Page = async () => {
    const t = await getTranslations();
    const subscription = await getSubscription(t);
    const user = await getUser();

    return (
        <>
            <Script id="meta-pixel" strategy="lazyOnload">
                {`
                <!-- Meta Pixel Code -->
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '1427772682038969');
                fbq('track', 'PageView');
                fbq('track', 'InitiateCheckout');
                <!-- End Meta Pixel Code -->
                `}
            </Script>
            <Main
                className="flex justify-center"
                gradientVariant="floatingGradient"
            >
                <Pricing user={user?.user || null} subs={subscription} />
            </Main>
        </>
    );
};

export { generateMetadata };
export default Page;
