import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AlertTriangle } from "lucide-react";
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

    const userdb = await db.user.findUnique({
        where: {
            id: user?.user?.id,
        },
        select: {
            sessions: true,
            googleId: true,
            password: true,
        },
    });

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
            sessions={userdb.sessions}
            sessionId={user!.session!.id}
        />,
        <DeleteAccount key="delete" />,
    ];

    return (
        <Main>
            <div className="max-w-4xl mx-auto">
                <AccoutMenu user={user.user} />
                <div className="flex flex-col gap-y-8">
                    {pages.map((PageComponent, index) => (
                        <div
                            key={index}
                            id={PageComponent.key as string}
                            className="p-6 bg-base-300/10 border border-neutral/20 rounded-box shadow"
                        >
                            <div className="flex items-center justify-start gap-x-2 mb-4">
                                {index === pages.length - 1 && (
                                    <span className="flex size-12 shrink-0 items-center justify-center rounded-box bg-red-100 sm:mx-0 sm:size-10">
                                        <AlertTriangle
                                            aria-hidden="true"
                                            className="size-6 text-error"
                                        />
                                    </span>
                                )}
                                <Title
                                    text={t(PageComponent.key as never)}
                                    className={cn(
                                        "",
                                        index === pages.length - 1 &&
                                            "text-error"
                                    )}
                                />
                            </div>
                            {PageComponent}
                        </div>
                    ))}
                </div>
            </div>
        </Main>
    );
};

export { generateMetadata };
export default Page;
