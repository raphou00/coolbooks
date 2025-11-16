import { type Metadata } from "next";
import Main from "@/components/layout/main";
import { getTranslations } from "next-intl/server";
import Book from "@/components/ui/book";
import db from "@/lib/db";
import { selectBook } from "@/config/book";
import { redirect } from "next/navigation";
import { title } from "@/config/seo";
import { getUser } from "@/lib/auth";

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
            author: book.user.name,
            app: title,
        }),
    };
};

const Page = async ({ params }: PageProps) => {
    const { bookId } = await params;
    if (!bookId) {
        redirect("/404");
    }

    const user = await getUser();

    const book = await db.book.findUnique({
        where: {
            id: bookId,
        },
        select: selectBook,
    });
    if (!book) {
        redirect("/404");
    }

    if (!book.public && book.user.id !== user?.user?.id) {
        redirect("/404");
    }

    return (
        <Main>
            <Book
                book={book}
                user={user?.user || null}
                isCreator={book.user.id === user?.user?.id}
            />
        </Main>
    );
};

export { generateMetadata };
export default Page;
