import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/auth";
import { Socials } from "./socials";
import db from "@/lib/db";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("account-socials.title"),
        description: t("account-socials.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    if (!user?.user) {
        redirect("/login");
    }

    const userdb = await db.user.findUnique({
        where: {
            id: user?.user?.id,
        },
        select: {
            googleId: true,
            discordId: true,
        },
    });

    return (
        <>
            <div className="w-full">
                <Socials
                    googleId={userdb?.googleId}
                    discordId={userdb?.discordId}
                />
            </div>
        </>
    );
};

export { generateMetadata };
export default Page;
