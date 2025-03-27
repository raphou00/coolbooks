import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { UpdatePassword, CreatePassword } from "./password";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("account-password.title"),
        description: t("account-password.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    const userdb = await db.user.findUnique({
        where: {
            id: user?.user?.id,
        },
        select: {
            password: true,
        },
    });

    if (!userdb) {
        redirect("/login");
    }

    return (
        <>
            <div className="w-full">
                {userdb.password ?
                    <UpdatePassword />
                :   <CreatePassword />}
            </div>
        </>
    );
};

export { generateMetadata };
export default Page;
