import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/auth";
import db from "@/lib/db";
import { cn } from "@/lib/utils";
import Main from "@/components/layout/main";
import Title from "@/components/ui/title";
import AccoutMenu from "./components/account";
import UpdateProfile from "./components/profile";
import Password from "./components/password";
import Socials from "./components/socials";
import LogoutSessions from "./components/sessions";
import DeleteAccount from "./components/delete";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations();
    return {
        title: t("pages.account.title"),
        description: t("pages.account.description"),
    };
};

const Page: React.FC = async () => {
    const t = await getTranslations("pages.account");
    const user = await getUser();

    const userdb = user?.user ? await db.users.get(user.user.id) : null;
    const sessions = user?.user ? await db.sessions.byUser(user.user.id) : [];

    if (!user?.user || !userdb) {
        return redirect("/login");
    }

    const pages = [
        <UpdateProfile
            key="profile"
            email={user.user.email}
            name={user.user.name}
        />,
        <Password key="password" hasPassword={!!userdb.password} />,
        <Socials key="socials" googleId={userdb.googleId} />,
        <LogoutSessions
            key="sessions"
            sessions={sessions}
            sessionId={user!.session!.id}
        />,
        <DeleteAccount key="delete" />,
    ];

    return (
        <Main>
            <div className="mx-auto max-w-5xl">
                <AccoutMenu user={user.user} />
                <div className="flex flex-col">
                    {pages.map((PageComponent, index) => {
                        const danger = index === pages.length - 1;
                        return (
                            <section
                                key={index}
                                id={PageComponent.key as string}
                                className="grid gap-6 border-t border-hairline py-10 md:grid-cols-12 md:gap-10"
                            >
                                <div className="md:col-span-4">
                                    <Title
                                        as="h2"
                                        text={t(PageComponent.key as never)}
                                        className={cn(
                                            "type-title-md",
                                            danger && "text-error"
                                        )}
                                    />
                                </div>
                                <div className="md:col-span-8">
                                    {PageComponent}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>
        </Main>
    );
};

export { generateMetadata };
export default Page;
