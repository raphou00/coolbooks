import { type Metadata } from "next";
import Script from "next/script";
import Main from "@/components/layout/main";
import { getTranslations } from "next-intl/server";
import NewBook from "./new";
import { getUser } from "@/lib/auth";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("new-book.title"),
        description: t("new-book.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    return (
        <>
            <Script id="meta-pixel-new" strategy="lazyOnload">
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
                fbq('track', 'ViewContent');
                <!-- End Meta Pixel Code -->
                `}
            </Script>
            <Main className="flex">
                <NewBook user={user?.user || null} />
            </Main>
        </>
    );
};

export { generateMetadata };
export default Page;
