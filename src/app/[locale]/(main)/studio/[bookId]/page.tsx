import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Main from "@/components/layout/main";
import Edit from "./edit";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("edit-book.title"),
        description: t("edit-book.description"),
    };
};

const Page = async ({ params }: { params: Promise<{ bookId: string }> }) => {
    const { bookId } = await params;
    if (!bookId) {
        redirect("/404");
    }

    const user = await getUser();
    if (!user?.user) {
        redirect("/login");
    }

    return (
        <Main className="flex">
            <Edit bookId={bookId} userId={user.user.id} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
