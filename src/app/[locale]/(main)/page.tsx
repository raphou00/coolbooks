import { getTranslations } from "next-intl/server";
import { ArrowRight, Heart } from "lucide-react";
import db from "@/lib/db";
import Main from "@/components/layout/main";
import Title from "@/components/ui/title";
import Medias, { type MediaProps } from "@/components/ui/medias";
import { findAllMedias } from "@/config/media";
import { name } from "@/config/seo";
import { getUser } from "@/lib/auth";
import { WelcomeModal } from "./home";
import Link from "next/link";

const Page = async () => {
    const t = await getTranslations("pages.home");

    const user = await getUser();

    const allMedias = await db.media.findMany({
        select: findAllMedias,
    });

    return (
        <Main>
            <div className="mb-6 mt-1">
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
                <Medias
                    medias={allMedias as MediaProps[]}
                    user={user?.user || null}
                />
            </div>
            <WelcomeModal />
        </Main>
    );
};

export default Page;
