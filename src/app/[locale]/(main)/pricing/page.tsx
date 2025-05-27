import { type Metadata } from "next";
import Main from "@/components/layout/main";
import { getTranslations } from "next-intl/server";
import Pricing from "./pricing";
import { getSubscription } from "@/lib/stripe";
import { getUser } from "@/lib/auth";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("pricing.title"),
        description: t("pricing.description"),
    };
};

const Page = async () => {
    const t = await getTranslations("pages.pricing");
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
