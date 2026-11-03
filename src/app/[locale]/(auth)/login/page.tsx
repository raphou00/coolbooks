import { type Metadata } from "next";
import Main from "@/components/layout/main";
import Login from "./login";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("login.title"),
        description: t("login.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    if (user?.user) {
        redirect("/");
    }

    return (
        <Main className="flex flex-1 items-center justify-center min-h-0 pt-6 pb-16 md:py-16">
            <Login />
        </Main>
    );
};

export { generateMetadata };
export default Page;
