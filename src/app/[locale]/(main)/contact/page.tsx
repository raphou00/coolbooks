import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import env from "@/lib/env";
import Main from "@/components/layout/main";
import Contact from "./contact";

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
            <Contact senderEmail={env.SENDER_EMAIL} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
