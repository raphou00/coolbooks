import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import Main from "@/components/layout/main";
import { canEditBook } from "@/lib/books";
import { addressOf, printOfBook } from "@/lib/printing";
import PrintPreview from "./print";

type PageProps = {
    params: Promise<{ bookId: string }>;
    searchParams: Promise<{ key?: string }>;
};

const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
    const t = await getTranslations("pages.print");
    const { bookId } = await params;
    const book = bookId ? await db.books.get(bookId) : null;
    return {
        title: t("title", { title: book?.title ?? "" }),
        robots: { index: false },
    };
};

/** Print preview and "Confirm & print" for a hardcover order. */
const Page = async ({ params, searchParams }: PageProps) => {
    const { bookId } = await params;
    const { key } = await searchParams;
    const book = bookId ? await db.books.get(bookId) : null;
    if (!book) return redirect("/404");
    if (!(await canEditBook(book.id, key))) return redirect("/404");

    const print = await printOfBook(book.id);
    if (!print) return redirect(`/book/${book.id}${key ? `?key=${key}` : ""}`);

    return (
        <Main>
            <PrintPreview
                bookId={book.id}
                title={book.title}
                editKey={key ?? null}
                status={print.status}
                trackingUrl={print.trackingUrl}
                address={addressOf(print)}
            />
        </Main>
    );
};

export { generateMetadata };
export default Page;
