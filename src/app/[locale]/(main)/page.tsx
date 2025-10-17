import Main from "@/components/layout/main";
import db from "@/lib/db";
import Link from "next/link";

const Page = async () => {
    const books = await db.book.findMany();

    return (
        <Main className="mt-8 flex" gradientVariant="floatingGradient">
            {books.map((book) => (
                <Link
                    key={book.id}
                    href={`/book/${book.id}`}
                    className="link link-primary"
                >
                    {book.title}
                </Link>
            ))}
        </Main>
    );
};

export default Page;
