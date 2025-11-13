import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/auth";
import { Billing } from "./billing";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("account-billing.title"),
        description: t("account-billing.description"),
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
                <Billing user={user.user} />
            </div>
        </>
    );
};

export { generateMetadata };
export default Page;
