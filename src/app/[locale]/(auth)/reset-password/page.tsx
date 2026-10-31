import { type Metadata } from "next";
import { redirect } from "next/navigation";
import Main from "@/components/layout/main";
import { getUser } from "@/lib/auth";
import ResetPassword from "./reset-password";
import { getTranslations } from "next-intl/server";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("reset-password.title"),
        description: t("reset-password.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    if (user?.user) {
        redirect("/");
    }

    return (
        <Main className="flex flex-1 items-center justify-center min-h-0 pt-6 pb-16 md:py-16">
            <ResetPassword />
        </Main>
    );
};

export { generateMetadata };
export default Page;
