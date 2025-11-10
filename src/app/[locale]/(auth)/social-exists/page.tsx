import { type Metadata } from "next";
import { redirect } from "next/navigation";
import Main from "@/components/layout/main";
import { getUser } from "@/lib/auth";
import SocialExists from "./social-exists";
import { getTranslations } from "next-intl/server";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("social-exists.title"),
        description: t("social-exists.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    if (user?.user) {
        redirect("/");
    }

    return (
        <Main className="flex w-full items-center justify-center mt-0">
            <SocialExists />
        </Main>
    );
};

export { generateMetadata };
export default Page;
