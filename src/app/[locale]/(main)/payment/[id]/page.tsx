import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import Main from "@/components/layout/main";
import Payment from "./payment";
import { redirect } from "@/lib/navigation";
import { getUser } from "@/lib/auth";

const generateMetadata = async ({
    params,
}: {
    params: { id: string };
}): Promise<Metadata> => {
    const t = await getTranslations("pages");
    const modelId = params.id;
    const creator = await db.creator.findUnique({
        where: { id: modelId },
    });

    return {
        title: t("payment.title", { name: creator?.name }),
        description: t("payment.description", { name: creator?.name }),
    };
};

const Page = async ({ params }: { params: { id: string } }) => {
    const user = await getUser();

    if (!user?.user) {
        redirect("/login");
    }

    const modelId = params.id;
    const creator = await db.creator.findUnique({
        where: { id: modelId },
    });

    if (!creator) {
        redirect("/");
        return null;
    }

    return (
        <Main>
            <Payment creator={creator} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
