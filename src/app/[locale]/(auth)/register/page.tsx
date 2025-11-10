import { type Metadata } from "next";
import { redirect } from "next/navigation";
import Main from "@/components/layout/main";
import { getUser } from "@/lib/auth";
import Register from "./register";
import { getTranslations } from "next-intl/server";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("register.title"),
        description: t("register.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    if (user?.user) {
        redirect("/");
    }

    return (
        <Main className="flex w-full items-center justify-center mt-0">
            <Register />
        </Main>
    );
};

export { generateMetadata };
export default Page;
