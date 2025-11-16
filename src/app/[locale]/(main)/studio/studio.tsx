"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { BookPlus, SearchIcon, Trash2 } from "lucide-react";
import NextImage from "@/components/ui/image";
import Title from "@/components/ui/title";
import Date from "@/components/ui/date";
import DeleteBook from "@/components/ui/delete-book";

type Books = {
    id: string;
    title: string;
    cover: string;
    user: {
        name: string;
    };
    updatedAt: Date;
}[];

type StudioProps = {
    books: Books;
};

const Studio: React.FC<StudioProps> = ({ books: allBooks }) => {
    const t = useTranslations("pages.studio");
    const [search, setSearch] = useState("");
    const [books, setBooks] = useState<Books>(allBooks);

    useEffect(() => {
        let filteredBooks = [...allBooks];

        if (search) {
            const searchRegex = new RegExp(search.toLowerCase(), "i");
            filteredBooks = filteredBooks.filter((book) =>
                searchRegex.test(book.title.toLowerCase())
            );
        }

        setBooks(filteredBooks);
    }, [search, allBooks]);

    return (
        <>
            <div className="relative w-full flex gap-y-6 space-x-2 mb-6 rounded-2xl overflow-hidden">
                <div className="w-full">
                    <div className="relative w-full">
                        <div className="cursor-pointer z-20 size-10 rounded-full flex items-center justify-center absolute left-0 top-1/2 mx-1.5 -translate-y-1/2">
                            <SearchIcon className="size-6 text-white" />
                        </div>
                        <input
                            type="text"
                            className="input input-lg input-bordered bg-black/70 text-white w-full border-2 tracking-wide transition placeholder:text-neutral-300 focus:border-neutral focus:outline-none focus:bg-black/80 pl-12 pr-9"
                            placeholder={t("search-placeholder")}
                            spellCheck={false}
                            autoComplete="off"
                            autoCapitalize="off"
                            autoCorrect="off"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <Link href="/studio/new" className="btn btn-lg btn-primary">
                    <BookPlus className="size-6 text-white" />
                    <span className="max-md:hidden">{t("create")}</span>
                </Link>
            </div>

            {books.length === 0 ?
                <div className="flex flex-col justify-between items-center">
                    <Image
                        src="/images/book-sad.svg"
                        width={400}
                        height={400}
                        alt="404"
                        className="mx-auto h-44 grayscale"
                    />
                    <Title
                        text={t("no-books")}
                        className="mx-auto w-fit text-center"
                    />
                </div>
            :   <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 md:gap-8">
                    {books.map((book) => (
                        <div key={book.id} className="group relative size-full">
                            <DeleteBook
                                bookId={book.id}
                                callback={() =>
                                    setBooks(
                                        books.filter((b) => b.id !== book.id)
                                    )
                                }
                            >
                                <div className="absolute z-50 top-2 right-2 transition opacity-0 group-hover:opacity-100">
                                    <button className="btn btn-sm btn-circle btn-soft btn-error">
                                        <Trash2 className="size-5" />
                                    </button>
                                </div>
                            </DeleteBook>

                            <Link href={`/book/${book.id}`}>
                                <div className="w-full aspect-square shadow-lg rounded-lg overflow-hidden">
                                    <NextImage
                                        className="group-hover:scale-105 transition-all"
                                        src={book.cover}
                                        width={1024}
                                        height={1024}
                                        alt={book.title}
                                    />
                                </div>
                                <div className="flex flex-col items-start text-sm font-bold mt-2">
                                    <h2 className="text-left truncate w-full">
                                        {book.title}
                                    </h2>
                                    <p className="text-neutral text-xs text-left truncate w-full">
                                        {t("modify")}{" "}
                                        <Date date={book.updatedAt} />
                                    </p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            }
        </>
    );
};

export default Studio;
