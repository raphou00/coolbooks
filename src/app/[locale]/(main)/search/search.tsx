"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { SearchIcon } from "lucide-react";
import NextImage from "@/components/ui/image";
import Title from "@/components/ui/title";
import Date from "@/components/ui/date";
import { useSearchParams } from "next/navigation";

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
    const q = useSearchParams().get("q");
    const [search, setSearch] = useState(q || "");
    const [books, setBooks] = useState<Books>(allBooks);

    const handleSearch = () => {
        let filteredBooks = [...allBooks];

        if (search) {
            const searchRegex = new RegExp(search.toLowerCase(), "i");
            filteredBooks = filteredBooks.filter((book) =>
                searchRegex.test(book.title.toLowerCase())
            );
        }

        setBooks(filteredBooks);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    return (
        <>
            <div className="relative w-full flex gap-y-6 space-x-2 mb-6 rounded-2xl overflow-hidden">
                <div className="w-full">
                    <div className="relative w-full">
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
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            className="btn btn-primary btn-circle z-20 absolute right-0 top-1/2 mx-1.5 -translate-y-1/2"
                            onClick={handleSearch}
                        >
                            <SearchIcon className="size-6" />
                        </button>
                    </div>
                </div>
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
                        <Link
                            key={book.id}
                            href={`/book/${book.id}`}
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
