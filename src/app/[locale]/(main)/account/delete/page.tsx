import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/auth";
import { DeleteAccount } from "./delete";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("account-delete.title"),
        description: t("account-delete.description"),
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
                <DeleteAccount />
            </div>
        </>
    );
};

export { generateMetadata };
export default Page;
