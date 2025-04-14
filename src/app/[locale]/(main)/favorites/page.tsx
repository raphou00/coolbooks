import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import Main from "@/components/layout/main";
import Favorites from "./favorites";
import type { GirlWithMedia } from "@/components/ui/girls";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("favorites.title"),
        description: t("favorites.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    let girls: GirlWithMedia[] = [];
    if (user?.user) {
        girls = (await db.girl.findMany({
            where: {
                id: {
                    in: user?.user?.girls,
                },
            },
        })) as GirlWithMedia[];
    }

    return (
        <Main>
            <Favorites girls={girls} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
