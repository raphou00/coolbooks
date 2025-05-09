import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { findGirlsWithMedias } from "@/config/girl";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { redirect } from "@/lib/navigation";
import Main from "@/components/layout/main";
import type { GirlWithMedia } from "@/components/ui/girls";
import Girl from "./girl";
import { getImage } from "@/lib/utils";

const generateMetadata = async ({
    params,
}: {
    params: { girl: string };
}): Promise<Metadata> => {
    const t = await getTranslations("pages");
    const girlName = params.girl;

    const girl = await db.girl.findFirst({
        where: { username: girlName },
        select: { name: true, avatar: true },
    });

    if (!girl) {
        return {
            title: t("girl.title", { name: girlName }),
            description: t("girl.description", { name: girlName }),
        };
    }

    return {
        title: t("girl.title", { name: girl.name }),
        description: t("girl.description", { name: girl.name }),
        openGraph: {
            type: "website",
            title: t("girl.title", { name: girl.name }),
            description: t("girl.description", { name: girl.name }),
            siteName: "Pinksea",
            locale: "en_US",
            images: [
                {
                    url: getImage(girl.avatar),
                    width: 800,
                    height: 600,
                    alt: "Pinksea",
                },
            ],
        },
    };
};

const Page = async ({ params }: { params: { girl: string } }) => {
    const girlName = params.girl;
    const girl = (await db.girl.findFirst({
        where: { username: girlName },
        select: findGirlsWithMedias,
    })) as GirlWithMedia | null;
    const user = await getUser();

    if (!girl) {
        redirect("/");
        return null;
    }

    return (
        <Main className="!pt-0">
            <Girl girl={girl} user={user?.user || null} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
