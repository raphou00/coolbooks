import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import Main from "@/components/layout/main";
import Title from "@/components/ui/title";
import Medias, { type MediaProps } from "@/components/ui/medias";
import { findAllMedias } from "@/config/media";
import { name } from "@/config/seo";
import { getUser } from "@/lib/auth";
import { WelcomeModal } from "./home";

const Page = async () => {
    const t = await getTranslations("common");

    const user = await getUser();

    const allMedias = await db.media.findMany({
        select: findAllMedias,
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <Main>
            <div className="py-8">
                <div className="hero-content justify-center text-center p-0 flex-col lg:flex-row">
                    <div>
                        <Title
                            text={name}
                            underline
                            className="md:text-4xl text-3xl w-fit mx-auto"
                        />
                        <p className="pb-2 max-w-xl mt-2">{t("description")}</p>
                    </div>
                </div>
            </div>
            {/* <div className="mb-6 mt-1">
                <div className="flex items-center justify-start max-sm:justify-between gap-x-4 mb-6">
                    <div className="flex items-center gap-x-2">
                        <Heart className="size-6 text-primary fill-primary" />
                        <Title
                            text={t("content", { name })}
                            className="text-lg md:text-xl lg:text-2xl"
                        />
                    </div>
                    <Link
                        href="/explore"
                        className="group flex items-center gap-1 link link-hover link-primary"
                    >
                        {t("sort")}
                        <ArrowRight className="size-5 transition group-hover:translate-x-1" />
                    </Link>
                </div>
            </div> */}
            <Medias
                medias={allMedias as MediaProps[]}
                user={user?.user || null}
            />
            <WelcomeModal />
        </Main>
    );
};

export default Page;
