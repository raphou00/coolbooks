import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import Main from "@/components/layout/main";
import Favorites from "./favorites";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("favorites.title"),
        description: t("favorites.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    if (!user?.user) {
        redirect("/login");
    }

    const books = await db.book.findMany({
        where: {
            id: {
                in: user.user.savedBooks,
            },
        },
        select: {
            id: true,
            title: true,
            cover: true,
            user: {
                select: {
                    name: true,
                },
            },
            updatedAt: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <Main className="flex">
            <Favorites user={user.user} books={books} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
