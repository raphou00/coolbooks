"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import NextImage from "@/components/ui/image";
import type { User } from "lucia";
import Title from "@/components/ui/title";
import { Search } from "lucide-react";
import { useState } from "react";
import { name } from "@/config/seo";

type Books = {
    id: string;
    title: string;
    promptText: string;
    cover: string;
    user: {
        name: string;
    };
}[];

type ExploreProps = {
    user: User | null;
    books: Books;
};

const Explore: React.FC<ExploreProps> = ({ books: allBooks, user }) => {
    const t = useTranslations("pages.explore");
    const [search, setSearch] = useState("");
    const [books, setBooks] = useState<Books>(allBooks);

    const applyFilters = (searchTerm: string) => {
        let filteredBooks = [...allBooks];

        if (searchTerm) {
            const searchRegex = new RegExp(searchTerm.toLowerCase(), "i");
            filteredBooks = filteredBooks.filter((book) =>
                searchRegex.test(book.title.toLowerCase())
            );
        }

        return filteredBooks;
    };

    const handleSearch = (searchTerm: string) => {
        setSearch(searchTerm);
        const filteredBooks = applyFilters(searchTerm);
        setBooks(filteredBooks);
    };

    return (
        <>
            <div className="flex flex-col items-center justify-center gap-y-6 mb-8">
                <div className="flex items-center gap-x-2">
                    <Title
                        text={t("main-title")}
                        className="text-4xl"
                        underline
                    />
                </div>
                <div className="w-full max-w-[500px]">
                    <div className="relative w-full">
                        <input
                            type="text"
                            className="input input-lg input-bordered w-full border-2 bg-base-100 tracking-wide transition placeholder:text-neutral-400 focus:border-neutral focus:outline-none focus:bg-base-300 pl-5 pr-9"
                            placeholder={t("search-placeholder")}
                            value={search}
                            onChange={(e) => handleSearch(e.target.value)}
                            spellCheck={false}
                            autoComplete="off"
                            autoCapitalize="off"
                            autoCorrect="off"
                        />
                        <button className="cursor-pointer z-20 size-9 bg-secondary rounded-full flex items-center justify-center absolute right-0 top-1/2 mx-1.5 -translate-y-1/2">
                            <Search className="size-5 text-white" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-2">
                {books.map((book) => (
                    <Link
                        key={book.id}
                        href={`/book/${book.id}`}
                        className="group relative size-full"
                    >
                        <div className="w-full aspect-square shadow-lg rounded-lg overflow-hidden">
                            <NextImage
                                className="group-hover:scale-105 transition-all"
                                src={book.cover}
                                width={1024}
                                height={1024}
                                alt={book.title}
                            />
                        </div>
                        <div className="flex flex-col items-center justify-center text-sm font-bold">
                            <h2 className="text-center">{book.title}</h2>
                            <p className="text-base-content/50">
                                {t("by")} {book.user.name}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
};

export default Explore;
