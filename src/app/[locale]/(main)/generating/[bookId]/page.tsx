import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import Main from "@/components/layout/main";
import Generating from "./generating";

type PageProps = {
    params: Promise<{ bookId: string }>;
};

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("generating.title"),
        description: t("generating.description"),
    };
};

const Page = async ({ params }: PageProps) => {
    const { bookId } = await params;
    if (!bookId) {
        redirect("/404");
    }

    return (
        <Main>
            <Generating bookId={bookId} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
