import { type Metadata } from "next";
import Main from "@/components/layout/main";
import { getTranslations } from "next-intl/server";
import Pricing from "./pricing";
import { getTiers } from "@/lib/stripe";
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
    const tiers = await getTiers(t);
    const user = await getUser();

    return (
        <Main className="mt-8">
            <Pricing user={user?.user || null} tiers={tiers} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
