"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { BookPlus, SearchIcon } from "lucide-react";
import NextImage from "@/components/ui/image";
import Title from "@/components/ui/title";
import Date from "@/components/ui/date";

type Books = {
    id: string;
    title: string;
    promptText: string;
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
                            <SearchIcon className="size-6" />
                        </div>
                        <input
                            type="text"
                            className="input input-lg input-bordered w-full border-2 bg-base-100 tracking-wide transition placeholder:text-neutral-400 focus:border-neutral focus:outline-none focus:bg-base-300 pl-12 pr-9"
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
                <button className="btn btn-lg btn-primary">
                    <BookPlus className="size-6" />
                    <span className="max-md:hidden">{t("create")}</span>
                </button>
            </div>

            {allBooks.length === 0 ?
                <div className="flex flex-col justify-between items-center">
                    <Image
                        src="/images/book-smiley.svg"
                        width={600}
                        height={600}
                        className="size-28"
                        alt=""
                    />
                    <Title
                        text={t("no-books")}
                        className="mx-auto w-fit text-center"
                        underline
                    />
                </div>
            : books.length === 0 && search.length > 0 ?
                <div className="flex flex-col justify-between items-center">
                    <Image
                        src="/images/book-smiley.svg"
                        width={600}
                        height={600}
                        className="size-28"
                        alt=""
                    />
                    <Title
                        text={t("no-books-found")}
                        className="mx-auto w-fit text-center"
                        underline
                    />
                </div>
            :   <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 md:gap-8">
                    {books.map((book) => (
                        <Link
                            key={book.id}
                            href={`/studio/${book.id}`}
                            className="group relative size-full"
                        >
                            <div className="w-full aspect-square shadow-lg rounded-lg overflow-hidden border-4 border-accent/20">
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
                                    {t("modify")} <Date date={book.updatedAt} />
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            }
        </>
    );
};

export default Studio;
