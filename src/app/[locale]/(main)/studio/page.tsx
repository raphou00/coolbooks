import { type Metadata } from "next";
import Main from "@/components/layout/main";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import Studio from "./studio";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("studio.title"),
        description: t("studio.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    if (!user?.user) {
        redirect("/login");
    }

    const books = await db.book.findMany({
        where: {
            userId: user.user.id,
        },
        select: {
            id: true,
            title: true,
            cover: true,
            promptText: true,
            user: {
                select: {
                    name: true,
                },
            },
            updatedAt: true,
        },
    });

    return (
        <Main className="mt-4 flex" gradientVariant="floatingGradient">
            <Studio books={books} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
