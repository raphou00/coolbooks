import { type Metadata } from "next";
import Main from "@/components/layout/main";
import Chat from "./chat";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/auth";
import { redirect } from "@/lib/navigation";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("chat.title"),
        description: t("chat.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    if (!user?.user) {
        return redirect("/login");
    }

    return (
        <Main className="mt-8">
            <Chat user={user.user} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
