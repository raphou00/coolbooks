import { type Metadata } from "next";
import Main from "@/components/layout/main";
import { getTranslations } from "next-intl/server";
import Pricing from "./pricing";
import { getSubscription } from "@/lib/stripe";
import { getUser } from "@/lib/auth";
import { formatAmountForDisplay } from "@/lib/utils";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations();
    const subscription = await getSubscription(t);
    return {
        title: t("pages.pricing.title"),
        description: t("pages.pricing.description", { price: formatAmountForDisplay(subscription.price) }),
    };
};

const Page = async () => {
    const t = await getTranslations();
    const subscription = await getSubscription(t);
    const user = await getUser();

    return (
        <Main className="mt-8">
            <Pricing user={user?.user || null} sub={subscription} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
