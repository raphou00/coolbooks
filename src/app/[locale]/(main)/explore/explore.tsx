"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import NextImage from "@/components/ui/image";

type BooksProps = {
    books: {
        id: string;
        title: string;
        cover: string;
        user: {
            name: string;
        };
    }[];
};

const Books: React.FC<BooksProps> = ({ books }) => {
    const t = useTranslations("pages.explore");
    return (
        <>
            <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-2">
                {books.map((book) => (
                    <Link
                        key={book.id}
                        href={`/book/${book.id}`}
                        className="group relative size-full rounded-lg shadow-lg overflow-hidden border-2 border-neutral"
                    >
                        <NextImage
                            className="group-hover:scale-105 transition-all"
                            src={book.cover}
                            width={1024}
                            height={1024}
                            alt={book.title}
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <h2 className="text-white text-center text-xl font-bold max-w-3/4">
                                {book.title}
                            </h2>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
};

export default Books;
