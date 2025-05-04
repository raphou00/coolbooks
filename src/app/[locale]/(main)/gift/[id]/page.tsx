import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { redirect } from "@/lib/navigation";
import Main from "@/components/layout/main";
import Gift from "./gift";

const generateMetadata = async ({
    params,
}: {
    params: { id: string };
}): Promise<Metadata> => {
    const t = await getTranslations("pages");
    const modelId = params.id;
    const girl = await db.girl.findUnique({
        where: { id: modelId },
    });

    return {
        title: t("gift.title", { name: girl?.name }),
        description: t("gift.description", { name: girl?.name }),
    };
};

const Page = async ({ params }: { params: { id: string } }) => {
    const modelId = params.id;
    const girl = await db.girl.findUnique({
        where: { id: modelId },
    });

    if (!girl) {
        redirect("/");
        return null;
    }

    return (
        <Main>
            <Gift girl={girl} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
