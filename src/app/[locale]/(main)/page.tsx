import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import Main from "@/components/layout/main";
import Books from "@/components/ui/books";
import Home, { Features, HowItWorks, VelocityText } from "./home";

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
            take: 10,
        });

    const [booksCartoon, booksAdventure, booksAnime, booksEducation] =
        await Promise.all([
            getBooksByFilter({ artStyle: "cartoon" }),
            getBooksByFilter({ themes: { has: "adventure" } }),
            getBooksByFilter({ artStyle: "anime" }),
            getBooksByFilter({ themes: { has: "education" } }),
        ]);

    return (
        <Main className="flex" gradientVariant="floatingGradient">
            <Home user={user?.user || null} />
            <VelocityText />
            <Books title={"🎉 " + t("cartoon")} books={booksCartoon} />
            <Books title={"🕵️‍♂️️ " + t("adventure")} books={booksAdventure} />
            <Features />
            <Books title={"💫 " + t("anime")} books={booksAnime} />
            <Books title={"📚 " + t("education")} books={booksEducation} />
            <HowItWorks />
        </Main>
    );
};

export default Page;
