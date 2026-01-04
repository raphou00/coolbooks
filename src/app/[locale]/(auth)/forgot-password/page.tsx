import { type Metadata } from "next";
import Main from "@/components/layout/main";
import ForgotPassword from "./forgot-password";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("forgot-password.title"),
        description: t("forgot-password.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    if (user?.user) {
        redirect("/");
    }

    return (
        <Main className="flex w-full items-center justify-center mt-0">
            <ForgotPassword />
        </Main>
    );
};

export { generateMetadata };
export default Page;
