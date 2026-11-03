import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import Main from "@/components/layout/main";
import { canEditBook, isBookLocked } from "@/lib/books";
import { printOfBook } from "@/lib/printing";
import Editor from "./editor";

type PageProps = {
    params: Promise<{ bookId: string }>;
    searchParams: Promise<{ key?: string }>;
};

const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
    const t = await getTranslations("pages.edit");
    const { bookId } = await params;
    const book = bookId ? await db.books.get(bookId) : null;
    return {
        title: t("title", { title: book?.title ?? "" }),
        robots: { index: false },
    };
};

/** Book editor: texts, colours and picture history. Owner or private link only. */
const Page = async ({ params, searchParams }: PageProps) => {
    const { bookId } = await params;
    const { key } = await searchParams;
    const book = bookId ? await db.books.getWithPages(bookId) : null;
    if (!book || !(await canEditBook(book.id, key))) return redirect("/404");

    const print = await printOfBook(book.id);

    return (
        <Main>
            <Editor
                editKey={key ?? null}
                locked={await isBookLocked(book.id)}
                hasPrint={!!print}
                book={{
                    id: book.id,
                    title: book.title,
                    dedication: book.dedication ?? "",
                    pages: [...book.pages]
                        .sort((a, b) => a.number - b.number)
                        .map((p) => ({
                            id: p.id,
                            number: p.number,
                            text: p.text,
                            color: p.color,
                            image: p.image,
                            previousImages: p.previousImages,
                        })),
                }}
            />
        </Main>
    );
};

export { generateMetadata };
export default Page;
