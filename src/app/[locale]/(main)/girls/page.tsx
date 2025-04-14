import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { findGirlsWithMedias } from "@/config/girl";
import Main from "@/components/layout/main";
import type { GirlWithMedia } from "@/components/ui/girls";
import Girls from "./girls";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("girls.title"),
        description: t("girls.description"),
    };
};

const Page = async () => {
    const girls = (await db.girl.findMany({
        select: findGirlsWithMedias,
    })) as GirlWithMedia[];
    return (
        <Main>
            <Girls girls={girls} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
