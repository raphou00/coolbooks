import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/auth";
import db from "@/lib/db";
import Main from "@/components/layout/main";
import Books from "@/components/ui/books";
import Home from "./home";

const Page = async () => {
    const user = await getUser();
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
        orderBy: {
            createdAt: "desc",
        },
    });

    const books = Array.from({ length: 10 }, (_, index) => ({
        ...booksWeekly[0],
        id: index.toString(),
    }));

    return (
        <Main className="flex my-0 pt-0">
            <Home books={books} />
            <Books title={t("explore") + " 📚"} books={books} />
            <Books title={t("explore") + " 📚"} books={books} />
            <Books title={t("explore") + " 📚"} books={books} />
            <Books title={t("explore") + " 📚"} books={books} />
            <Books title={t("explore") + " 📚"} books={books} />
        </Main>
    );
};

export default Page;
