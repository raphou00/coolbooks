import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import Main from "@/components/layout/main";
import MyBooks from "./my-books";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("my-books.title"),
        description: t("my-books.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    if (!user?.user) {
        redirect("/login");
    }

    const books = (await db.books.byUser(user.user.id)).map((b) => ({
        id: b.id,
        title: b.title,
        cover: b.cover,
        createdAt: b.createdAt,
    }));

    return (
        <Main>
            <MyBooks books={books} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
