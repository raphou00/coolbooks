import { type Metadata } from "next";
import Main from "@/components/layout/main";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import Books from "./explore";
import { getUser } from "@/lib/auth";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("explore.title"),
        description: t("explore.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    const books = await db.book.findMany({
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
        },
    });

    return (
        <Main className="mt-8 flex" gradientVariant="heroGradient">
            <Books user={user?.user || null} books={books} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
