import { type Metadata } from "next";
import Main from "@/components/layout/main";
import { getTranslations } from "next-intl/server";
import Pricing from "./pricing";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("pricing.title"),
        description: t("pricing.description"),
    };
};

const Page = async () => {
    return (
        <Main className="mt-8">
            <Pricing />
        </Main>
    );
};

export { generateMetadata };
export default Page;
