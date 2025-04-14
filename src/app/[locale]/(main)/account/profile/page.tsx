import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/auth";
import { UpdateProfile } from "./profile";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("account-profile.title"),
        description: t("account-profile.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    if (!user?.user) {
        redirect("/login");
    }

    return (
        <>
            <div className="w-full">
                <UpdateProfile email={user.user.email} name={user.user.name} />
            </div>
        </>
    );
};

export { generateMetadata };
export default Page;
