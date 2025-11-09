import { type Metadata } from "next";
import Main from "@/components/layout/main";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import Search from "./search";

type PageProps = {
    searchParams: Promise<{
        q: string;
    }>;
};

const generateMetadata = async ({
    searchParams,
}: PageProps): Promise<Metadata> => {
    const t = await getTranslations("pages");
    const { q } = await searchParams;
    return {
        title: t("search.title", { query: q }),
        description: t("search.description", { query: q }),
    };
};

const Page = async () => {
    const books = await db.book.findMany({
        select: {
            id: true,
            title: true,
            cover: true,
            themes: true,
            artStyle: true,
            public: true,
            pages: {
                select: {
                    text: true,
                },
            },
            user: {
                select: {
                    name: true,
                },
            },
            updatedAt: true,
        },
        where: {
            public: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <Main className="flex" gradientVariant="floatingGradient">
            <Search books={books} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
