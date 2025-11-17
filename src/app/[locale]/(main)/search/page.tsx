import { type Metadata } from "next";
import Main from "@/components/layout/main";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import Search from "./search";
import { getUser } from "@/lib/auth";

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
    if (!q) {
        return {
            title: t("search.title-save"),
            description: t("search.subtitle"),
        };
    }
    return {
        title: t("search.title", { query: q }),
        description: t("search.description", { query: q }),
    };
};

const Page = async () => {
    const user = await getUser();

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
        <Main className="flex">
            <Search user={user?.user || null} books={books} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
