import { type Metadata } from "next";
import Main from "@/components/layout/main";
import { getTranslations } from "next-intl/server";
import NewBook from "./new";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("new-book.title"),
        description: t("new-book.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    if (!user?.user) {
        redirect("/login?redirect=/studio/new");
    }

    return (
        <Main className="flex">
            <NewBook user={user.user} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
