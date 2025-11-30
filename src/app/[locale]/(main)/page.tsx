import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import Main from "@/components/layout/main";
import { Hero, Books, Bento } from "./home";

type Filter = {
    id?: { in: string[] };
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
            take: 10,
            orderBy: { createdAt: "desc" },
        });

    const [booksCartoon, booksAdventure, booksAnime, booksEducation] =
        await Promise.all([
            getBooksByFilter({ artStyle: "cartoon" }),
            getBooksByFilter({ themes: { has: "adventure" } }),
            getBooksByFilter({ artStyle: "anime" }),
            getBooksByFilter({ themes: { has: "education" } }),
        ]);

    return (
        <Main>
            <Hero user={user?.user || null} />
            <Bento />
            <Books
                title={"🦄 " + t("cartoon")}
                books={booksCartoon}
                user={user?.user || null}
            />
            <Books
                title={"🧚🏻 " + t("adventure")}
                books={booksAdventure}
                user={user?.user || null}
            />
            <Books
                title={"💫 " + t("anime")}
                books={booksAnime}
                user={user?.user || null}
            />
            <Books
                title={"🧑‍🎓 " + t("education")}
                books={booksEducation}
                user={user?.user || null}
            />
        </Main>
    );
};

export default Page;
