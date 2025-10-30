import { type Metadata } from "next";
import Main from "@/components/layout/main";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import Search from "./search";

type PageProps = {
    searchParams: {
        q: string;
    };
};

const generateMetadata = async ({
    searchParams,
}: PageProps): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("search.title", { query: searchParams.q }),
        description: t("search.description", { query: searchParams.q }),
    };
};

const Page = async () => {
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
            updatedAt: true,
        },
    });

    return (
        <Main className="flex">
            <Search books={books} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
