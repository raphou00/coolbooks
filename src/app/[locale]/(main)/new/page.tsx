import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Main from "@/components/layout/main";
import Title from "@/components/ui/title";
import NewBook from "@/components/ui/new";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("new-book.title"),
        description: t("new-book.description"),
    };
};

const Page = async () => {
    const t = await getTranslations("pages.new-book");

    return (
        <Main>
            <div className="relative w-full flex flex-col items-center justify-center gap-y-6 mx-auto">
                <Title
                    text={t("title")}
                    className="text-4xl lg:text-5xl text-center mb-2"
                />
                <NewBook />
            </div>
        </Main>
    );
};

export { generateMetadata };
export default Page;
