"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";
import { artStyleOptions, themesOptions } from "@/schema/book";
import NextImage from "@/components/ui/image";
import Title from "@/components/ui/title";

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

    const handleSearch = () => {
        let filteredBooks = [...allBooks];

        if (search) {
            const searchRegex = new RegExp(search.toLowerCase(), "i");
            filteredBooks = filteredBooks.filter((book) => {
                const pagesText = book.pages
                    .map((page) => page.text)
                    .join(" ")
                    .toLowerCase();

                return (
                    searchRegex.test(book.title.toLowerCase()) ||
                    searchRegex.test(pagesText)
                );
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
            <div className="text-center my-6 px-4">
                <Title
                    text={search || t("title-save")}
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
                />
                <p className="text-neutral text-base md:text-lg max-w-2xl mx-auto">
                    {t("subtitle")}
                </p>
            </div>

            <div className="w-full mb-4">
                <div className="w-full flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
                    <div className="overflow-x-scroll scrollbar-hide flex gap-2">
                        {themesOptions.map((theme) => (
                            <button
                                key={theme}
                                onClick={() => handleThemeToggle(theme)}
                                className={cn(
                                    "btn gap-2",
                                    activeThemes.includes(theme) ?
                                        "btn-secondary"
                                    :   ""
                                )}
                            >
                                <span className="text-lg">
                                    {themeImages[theme]}
                                </span>
                                {t(theme)}
                            </button>
                        ))}
                    </div>

                    <div className="dropdown dropdown-end">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-soft bg-secondary/10"
                        >
                            <Paintbrush className="size-4" />
                            <span className="hidden sm:inline">
                                {t("art-style")}
                            </span>
                        </div>
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu bg-base-200 rounded-box z-[1] w-64 p-3 shadow-xl border border-base-300 mt-2"
                        >
                            {artStyleOptions.map((artStyle) => (
                                <li key={artStyle} className="my-1">
                                    <button
                                        onClick={() =>
                                            handleArtStyleSelect(artStyle)
                                        }
                                        className={cn(
                                            "rounded-xl flex items-center justify-start gap-3 p-3 transition-all duration-200",
                                            activeArtStyle === artStyle ?
                                                "bg-primary text-primary-content shadow-md"
                                            :   "hover:bg-base-300"
                                        )}
                                    >
                                        <div className="relative w-10 h-10 flex-shrink-0">
                                            <Image
                                                src={artStyleImages[artStyle]}
                                                width={40}
                                                height={40}
                                                alt={artStyle}
                                                className="rounded-lg object-cover"
                                            />
                                        </div>
                                        <span className="capitalize text-base font-medium">
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
                <div className="flex flex-col justify-center items-center py-16 px-4">
                    <div className="relative mb-8">
                        <Image
                            src="/images/book-sad.svg"
                            width={400}
                            height={400}
                            alt="No books found"
                            className="h-48 w-auto grayscale opacity-60 animate-pulse"
                        />
                    </div>
                    <Title
                        text={t("no-books")}
                        className="text-2xl md:text-3xl text-center mb-4"
                    />
                    <p className="text-neutral text-center max-w-md">
                        {t("no-books")}
                    </p>
                </div>
            :   <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 md:gap-8 pb-8">
                    {books.map((book, index) => (
                        <Link
                            key={book.id}
                            href={`/book/${book.id}`}
                            className="group relative w-full transition-transform duration-300 hover:-translate-y-2"
                            style={{
                                animationDelay: `${index * 50}ms`,
                            }}
                        >
                            <div className="relative aspect-square shadow-xl rounded-2xl overflow-hidden bg-base-300">
                                <NextImage
                                    className="transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
                                    src={book.cover}
                                    width={1024}
                                    height={1024}
                                    alt={book.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </div>

                            <div className="flex flex-col items-start mt-4 px-1">
                                <h2 className="text-left text-base md:text-lg font-bold truncate w-full group-hover:text-primary transition-colors duration-200">
                                    {book.title}
                                </h2>
                                {book.user && (
                                    <p className="text-neutral text-xs md:text-sm text-left truncate w-full mt-1">
                                        {t("by")}{" "}
                                        <span className="font-medium">
                                            {book.user.name}
                                        </span>
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
