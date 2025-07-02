import { type Metadata } from "next";
import Main from "@/components/layout/main";
import { getTranslations } from "next-intl/server";
import Explore from "./explore";
import { getUser } from "@/lib/auth";
import db from "@/lib/db";
import { findAllMedias } from "@/config/media";
import type { MediaProps } from "@/components/ui/medias";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("explore.title"),
        description: t("explore.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    const allMedias = await db.media.findMany({
        select: findAllMedias,
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <Main className="mt-8">
            <Explore
                user={user?.user || null}
                allMedias={allMedias as MediaProps[]}
            />
        </Main>
    );
};

export { generateMetadata };
export default Page;
