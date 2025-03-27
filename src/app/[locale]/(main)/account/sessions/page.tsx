import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { LogoutSessions } from "./sessions";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("account-sessions.title"),
        description: t("account-sessions.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    const userdb = await db.user.findUnique({
        where: {
            id: user?.user?.id,
        },
        select: {
            sessions: true,
        },
    });

    if (!userdb) {
        redirect("/login");
    }

    return (
        <>
            <div className="w-full">
                <LogoutSessions
                    sessions={userdb.sessions}
                    sessionId={user!.session!.id}
                />
            </div>
        </>
    );
};

export { generateMetadata };
export default Page;
