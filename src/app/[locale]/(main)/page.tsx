import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import Main from "@/components/layout/main";
import Books from "@/components/ui/books";
import Home from "./home";

const Page = async () => {
    const t = await getTranslations("pages.home");

    const booksWeekly = await db.book.findMany({
        select: {
            id: true,
            title: true,
            cover: true,
            user: {
                select: {
                    name: true,
                },
            },
        },
        take: 5,
        orderBy: {
            createdAt: "desc",
        },
    });

    const booksExplore = await db.book.findMany({
        select: {
            id: true,
            title: true,
            cover: true,
            user: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <Main className="flex my-0 pt-0 space-y-2">
            <Home />
            <Books title={t("weekly") + " 🔥"} books={booksWeekly} />
            <Books title={t("explore") + " 📚"} books={booksExplore} />
        </Main>
    );
};

export default Page;
