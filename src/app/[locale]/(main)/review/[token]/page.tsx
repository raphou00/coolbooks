import { type Metadata } from "next";
import { getTranslations } from "next-intl/server";
import db from "@/lib/db";
import Main from "@/components/layout/main";
import { REVIEW_PERCENT } from "@/lib/printing";
import ReviewForm from "./review";

type PageProps = { params: Promise<{ token: string }> };

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages.review");
    return { title: t("title"), robots: { index: false } };
};

/** No-login review page, reached from the review email. */
const Page = async ({ params }: PageProps) => {
    const t = await getTranslations("pages.review");
    const { token } = await params;
    const print = token ? await db.prints.byReviewToken(token) : null;
    const book = print ? await db.books.get(print.bookId) : null;

    if (!print || !book) {
        return (
            <Main>
                <p className="type-body mx-auto max-w-xl px-4 py-20 text-center">
                    {t("invalid")}
                </p>
            </Main>
        );
    }

    const existing = await db.reviews.get(print.id);

    return (
        <Main>
            <ReviewForm
                token={token}
                title={book.title}
                percent={REVIEW_PERCENT}
                existingCode={existing?.promoCode ?? null}
            />
        </Main>
    );
};

export { generateMetadata };
export default Page;
