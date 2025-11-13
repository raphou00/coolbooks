import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import Main from "@/components/layout/main";
import Books from "@/components/ui/books";
import Home from "./home";
import { getUser } from "@/lib/auth";

type Filter = {
    artStyle?: string;
    themes?: { has: string };
};

const Page = async () => {
    const t = await getTranslations("pages.home");
    const user = await getUser();

    const getBooksByFilter = (filter: Filter) =>
        db.book.findMany({
            where: {
                ...filter,
                public: true,
            },
            select: {
                id: true,
                title: true,
                cover: true,
                user: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 5,
        });

    const [booksCartoon, booksAdventure, booksAnime, booksEducation] =
        await Promise.all([
            getBooksByFilter({ artStyle: "cartoon" }),
            getBooksByFilter({ themes: { has: "adventure" } }),
            getBooksByFilter({ artStyle: "anime" }),
            getBooksByFilter({ themes: { has: "education" } }),
        ]);

    return (
        <Main className="flex my-0 pt-0" gradientVariant="floatingGradient">
            <Home user={user?.user || null} />
            <Books title={t("cartoon") + " 🎉"} books={booksCartoon} />
            <Books title={t("adventure") + " 🕵️‍♂️"} books={booksAdventure} />
            <Books title={t("anime") + " 💫"} books={booksAnime} />
            <Books title={t("education") + " 📚"} books={booksEducation} />
        </Main>
    );
};

export default Page;
