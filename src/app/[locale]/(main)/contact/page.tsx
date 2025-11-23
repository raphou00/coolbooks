import { type Metadata } from "next";
import Main from "@/components/layout/main";
import Contact from "./contact";
import { getTranslations } from "next-intl/server";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("contact.title"),
        description: t("contact.description"),
    };
};

const Page = async () => {
    return (
        <Main>
            <Contact />
        </Main>
    );
};

export { generateMetadata };
export default Page;
