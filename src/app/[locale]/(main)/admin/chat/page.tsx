import { type Metadata } from "next";
import Main from "@/components/layout/main";
import Chat from "./chat";
import { getTranslations } from "next-intl/server";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("chat.title"),
        description: t("chat.description"),
    };
};

const Page = async () => {
    return (
        <Main className="mt-8">
            <Chat />
        </Main>
    );
};

export { generateMetadata };
export default Page;
