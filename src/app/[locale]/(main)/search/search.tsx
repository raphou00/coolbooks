"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Bookmark, Info, Paintbrush } from "lucide-react";
import { cn } from "@/lib/utils";
import { artStyleOptions, themesOptions } from "@/schema/book";
import NextImage from "@/components/ui/image";
import Title from "@/components/ui/title";
import useSave from "@/hook/use-save";
import toast from "react-hot-toast";
import { User } from "lucia";

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
    user: User | null;
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

const Search: React.FC<SearchProps> = ({ user, books: allBooks }) => {
    const t = useTranslations("pages.search");
    const tLoginSave = useTranslations("links");
    const q = useSearchParams().get("q");
    const [search] = useState(q || "");
    const [books, setBooks] = useState<Books>(allBooks);
    const [activeThemes, setActiveThemes] = useState<string[]>([]);
    const [activeArtStyle, setActiveArtStyle] = useState<string | null>(null);
    const [allSavedBooks, setAllSavedBooks] = useState<string[]>(
        user?.savedBooks || []
    );
    const toggleSave = useSave();

    const handleSave = async (bookId: string) => {
        if (!user) {
            toast(tLoginSave("login-save"), {
                icon: <Info className="text-info" />,
            });
            return;
        }

        const alreadySaved = allSavedBooks.includes(bookId);

        if (alreadySaved) {
            setAllSavedBooks(allSavedBooks.filter((id) => id !== bookId));
        } else {
            setAllSavedBooks([...allSavedBooks, bookId]);
        }

        setBooks(
            books.map((book) => {
                if (book.id === bookId) {
                    return {
                        ...book,
                        saved: !alreadySaved,
                    };
                }
                return book;
            })
        );

        await toggleSave(alreadySaved ? "unsave" : "save", bookId);
    };

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
                    className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary"
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
                </div>
            :   <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 md:gap-8 pb-8">
                    {books.map((book) => (
                        <div key={book.id} className="relative w-full">
                            <button
                                className="absolute right-0 bottom-15 z-60 bg-primary/95 rounded-l-full pl-2 pr-3 py-1 max-md:hidden cursor-pointer"
                                onClick={() => handleSave(book.id)}
                            >
                                <Bookmark
                                    className={cn(
                                        "size-6 text-white",
                                        allSavedBooks.includes(book.id) &&
                                            "fill-white"
                                    )}
                                />
                            </button>
                            <Link href={`/book/${book.id}`}>
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
                        </div>
                    ))}
                </div>
            }
        </>
    );
};

export default Search;
