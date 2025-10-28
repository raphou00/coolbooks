import { type Metadata } from "next";
import Main from "@/components/layout/main";
import { getTranslations } from "next-intl/server";
import Pricing from "./pricing";
import { getSubscription } from "@/lib/stripe";
import { getUser } from "@/lib/auth";

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
        <Main
            className="flex justify-center"
            gradientVariant="floatingGradient"
        >
            <Pricing user={user?.user || null} subs={subscription} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
