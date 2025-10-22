"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import NextImage from "@/components/ui/image";
import Title from "@/components/ui/title";
import Search from "@/components/ui/search";
import { useEffect, useState } from "react";

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
    books: Books;
};

const placeholders = ["Football", "Astronaut", "Science"];

const Explore: React.FC<ExploreProps> = ({ books: allBooks }) => {
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

    const handleSearch = () => {
        const filteredBooks = applyFilters(search);
        setBooks(filteredBooks);
    };

    useEffect(() => {
        handleSearch();
    }, [search]);

    return (
        <>
            <div className="relative w-full flex flex-col items-center justify-center gap-y-6 mb-8 p-6 space-y-2 md:p-12 rounded-2xl  overflow-hidden">
                <div
                    className="absolute inset-0 brightness-75 rounded-2xl size-full"
                    style={{
                        backgroundImage:
                            "url('/images/magical-forest-kid-reading-a-book-fantastic.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                />
                <div className="flex items-center gap-x-2 pt-2 z-20">
                    <Title
                        text={t("main-title")}
                        className="text-4xl md:text-5xl text-center text-white"
                    />
                </div>
                <div className="w-full">
                    <Search
                        placeholders={placeholders}
                        onChange={(e) => setSearch(e.target.value)}
                        onSubmit={handleSearch}
                    />
                </div>
            </div>

            <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-8 lg:gap-16">
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
                        <div className="flex flex-col items-center justify-center text-sm font-bold gap-y-1">
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
