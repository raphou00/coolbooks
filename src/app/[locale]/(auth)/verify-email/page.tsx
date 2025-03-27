import { type Metadata } from "next";
import Main from "@/components/layout/main";
import VerifyEmail from "./verify-email";
import { getUser } from "@/lib/auth";
import { redirect } from "@/lib/navigation";
import { getTranslations } from "next-intl/server";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("verify-email.title"),
        description: t("verify-email.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    if (!user?.user || user.user.emailVerified) {
        redirect("/");
    }

    return (
        <Main className="flex w-full items-center justify-center">
            <VerifyEmail />
        </Main>
    );
};

export { generateMetadata };
export default Page;
