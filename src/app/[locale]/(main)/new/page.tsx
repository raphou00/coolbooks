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
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
                <Title text={t("title")} className="type-display-lg" />
                <NewBook />
            </div>
        </Main>
    );
};

export { generateMetadata };
export default Page;
