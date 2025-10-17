import { type Metadata } from "next";
import Main from "@/components/layout/main";
import { getTranslations } from "next-intl/server";
import BookViewer from "@/components/ui/book";
import db from "@/lib/db";
import { selectBook } from "@/config/book";
import { redirect } from "next/navigation";
import { title } from "@/config/seo";

const generateMetadata = async ({
    params,
}: {
    params: { bookId: string };
}): Promise<Metadata> => {
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

const Page = async ({ params }: { params: { bookId: string } }) => {
    const { bookId } = await params;
    if (!bookId) {
        redirect("/404");
    }

    const book = await db.book.findUnique({
        where: {
            id: bookId,
        },
        select: selectBook,
    });
    if (!book) {
        redirect("/404");
    }

    return (
        <Main className="mt-8 flex" gradientVariant="floatingGradient">
            <BookViewer book={book} />
        </Main>
    );
};

export { generateMetadata };
export default Page;
