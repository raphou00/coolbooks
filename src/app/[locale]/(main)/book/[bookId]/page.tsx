import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import { title } from "@/config/seo";
import Main from "@/components/layout/main";
import { canEditBook } from "@/lib/books";
import { maxRedraws } from "@/config/stripe";
import Book from "./book";

type PageProps = {
    params: Promise<{ bookId: string }>;
    searchParams: Promise<{ key?: string }>;
};

const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
    const t = await getTranslations("pages");
    const { bookId } = await params;
    if (!bookId) {
        redirect("/404");
    }

    const book = await db.books.get(bookId);
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

const Page = async ({ params, searchParams }: PageProps) => {
    const { bookId } = await params;
    const { key } = await searchParams;
    if (!bookId) {
        redirect("/404");
    }

    const book = await db.books.getWithPages(bookId);
    if (!book) {
        return redirect("/404");
    }

    const canEdit = await canEditBook(book.id, key);

    return (
        <Main>
            <Book
                book={{
                    id: book.id,
                    title: book.title,
                    cover: book.cover,
                    dedication: book.dedication,
                    redraws: book.redraws,
                    pages: book.pages.map((p) => ({
                        id: p.id,
                        number: p.number,
                        text: p.text,
                        color: p.color,
                        image: p.image,
                    })),
                }}
                canEdit={canEdit}
                editKey={canEdit ? (key ?? null) : null}
                maxRedraws={maxRedraws}
            />
        </Main>
    );
};

export { generateMetadata };
export default Page;
