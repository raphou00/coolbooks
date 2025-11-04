import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Main from "@/components/layout/main";
import Edit from "./edit";
import { redirect } from "next/navigation";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("edit-book.title"),
        description: t("edit-book.description"),
    };
};

const Page = async ({ params }: { params: { bookId: string } }) => {
    const { bookId } = await params;

    if (!bookId) {
        redirect("/404");
    }

    return (
        <Main className="flex">
            <Edit bookId={bookId} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
