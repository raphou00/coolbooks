"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { EyeIcon, Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";
import { artStyleOptions, themesOptions } from "@/schema/book";
import NextImage from "@/components/ui/image";
import Title from "@/components/ui/title";
import Date from "@/components/ui/date";

type Books = {
    id: string;
    title: string;
    cover: string;
    themes: string[];
    artStyle: string;
    public: boolean;
    pages: {
        text: string;
    }[];
    user: {
        name: string;
    };
    updatedAt: Date;
}[];

type SearchProps = {
    books: Books;
};

const themeImages: Record<string, string> = {
    hero: "🦸",
    adventure: "🕵️‍♂️",
    education: "👨‍🎓",
    friendship: "👫",
    magic: "🧙",
    bedtime: "😴",
};

const artStyleImages: Record<string, string> = {
    cartoon: "/images/artstyles/cartoon.png",
    comics: "/images/artstyles/comics.png",
    anime: "/images/artstyles/anime.png",
};

const Search: React.FC<SearchProps> = ({ books: allBooks }) => {
    const t = useTranslations("pages.search");
    const q = useSearchParams().get("q");
    const [search] = useState(q || "");
    const [books, setBooks] = useState<Books>(allBooks);
    const [activeThemes, setActiveThemes] = useState<string[]>([]);
    const [activeArtStyle, setActiveArtStyle] = useState<string | null>(null);

    console.log(allBooks.length);
    console.log(books.length);

    const handleSearch = () => {
        let filteredBooks = [...allBooks];

        if (search) {
            const searchRegex = new RegExp(search.toLowerCase(), "i");
            filteredBooks = filteredBooks.filter((book) =>
                searchRegex.test(book.title.toLowerCase())
            );

            filteredBooks = filteredBooks.filter((book) => {
                const pagesText = book.pages
                    .map((page) => page.text)
                    .join(" ")
                    .toLowerCase();
                console.log(pagesText);

                return searchRegex.test(pagesText);
            });
        }

        if (activeThemes.length > 0) {
            filteredBooks = filteredBooks.filter((book) => {
                return activeThemes.some((theme) =>
                    book.themes.includes(theme)
                );
            });
        }

        if (activeArtStyle) {
            filteredBooks = filteredBooks.filter(
                (book) => book.artStyle === activeArtStyle
            );
        }

        setBooks(filteredBooks);
    };

    const handleThemeToggle = (theme: string) => {
        setActiveThemes((prev) => {
            const newThemes =
                prev.includes(theme) ?
                    prev.filter((t) => t !== theme)
                :   [...prev, theme];
            return newThemes;
        });
    };

    const handleArtStyleSelect = (artStyle: string) => {
        setActiveArtStyle((prev) => (prev === artStyle ? null : artStyle));
    };

    useEffect(() => {
        handleSearch();
    }, [activeThemes, activeArtStyle, search]);

    return (
        <>
            <div className="text-center my-8">
                <Title
                    text={search || t("title-save")}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3"
                />
                <p className="text-neutral text-base md:text-lg">
                    {t("subtitle")}
                </p>
            </div>

            <div className="w-full mb-4">
                <div className="w-full flex items-center justify-between gap-3">
                    <div className="overflow-x-auto scrollbar-hide flex gap-x-2">
                        {themesOptions.map((theme) => (
                            <button
                                key={theme}
                                onClick={() => handleThemeToggle(theme)}
                                className={cn(
                                    "btn gap-2",
                                    activeThemes.includes(theme) ? "btn-primary"
                                    :   "btn-outline"
                                )}
                            >
                                <span className="text-lg">
                                    {themeImages[theme]}
                                </span>{" "}
                                {t(theme)}
                            </button>
                        ))}
                    </div>

                    <div className="dropdown dropdown-end">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-outline m-1"
                        >
                            <Paintbrush className="size-4" />
                            <span className="hidden sm:inline">
                                {t("art-style")}
                            </span>
                        </div>
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu bg-base-200 rounded-box z-1 w-52 p-2 shadow border border-neutral"
                        >
                            {artStyleOptions.map((artStyle) => (
                                <li key={artStyle} className="my-px">
                                    <button
                                        onClick={() =>
                                            handleArtStyleSelect(artStyle)
                                        }
                                        className={cn(
                                            "btn-ghost btn-lg rounded-xl flex items-center justify-start gap-3",
                                            activeArtStyle === artStyle &&
                                                "bg-primary text-primary-content"
                                        )}
                                    >
                                        <Image
                                            src={artStyleImages[artStyle]}
                                            width={40}
                                            height={40}
                                            alt={artStyle}
                                            className="rounded-xl"
                                        />
                                        <span className="capitalize text-lg">
                                            {artStyle}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
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
            :   <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                    {books.map((book) => (
                        <Link
                            key={book.id}
                            href={`/book/${book.id}`}
                            className="relative flex-shrink-0 w-56 md:w-60 lg:w-64 xl:w-72"
                        >
                            <div className="aspect-square shadow-lg rounded-lg overflow-hidden">
                                <NextImage
                                    className="hover:scale-105 transition-all"
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
                                {book.user && (
                                    <p className="text-neutral text-xs text-left truncate w-full">
                                        {t("by")} {book.user.name}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            }
        </>
    );
};

export default Search;
