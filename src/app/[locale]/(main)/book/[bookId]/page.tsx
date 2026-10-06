import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { getUser } from "@/lib/auth";
import { title } from "@/config/seo";
import Main from "@/components/layout/main";
import Book from "./book";

type PageProps = {
    params: Promise<{ bookId: string }>;
};

const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
    const t = await getTranslations("pages");
    const { bookId } = await params;
    if (!bookId) {
        redirect("/404");
    }

    const book = await db.book.findUnique({
        where: {
            id: bookId,
        },
        select: {
            title: true,
            user: {
                select: {
                    name: true,
                },
            },
        },
    });
    if (!book) {
        redirect("/404");
    }

    return {
        title: t("book.title", { title: book.title }),
        description: t("book.description", {
            title: book.title,
            app: title,
        }),
    };
};

const Page = async ({ params }: PageProps) => {
    const { bookId } = await params;
    if (!bookId) {
        redirect("/404");
    }

    const book = await db.book.findUnique({
        where: {
            id: bookId,
        },
        select: {
            id: true,
            title: true,
            cover: true,
            userId: true,
            pages: {
                select: {
                    number: true,
                    id: true,
                    text: true,
                    color: true,
                    image: true,
                },
            },
        },
    });
    if (!book) {
        return redirect("/404");
    }

    const user = await getUser();
    const canDelete =
        !!user?.user &&
        (book.userId === user.user.id || user.user.role === "ADMIN");

    return (
        <Main>
            <Book book={book} canDelete={canDelete} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
