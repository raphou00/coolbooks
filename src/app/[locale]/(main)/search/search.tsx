"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState, useRef } from "react";
import {
    Baby,
    Bookmark,
    ChevronLeft,
    ChevronRight,
    Info,
    Paintbrush,
    SearchIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import type { User } from "lucia";
import { ageOptions, artStyleOptions, themesOptions } from "@/schema/book";
import NextImage from "@/components/ui/image";
import Title from "@/components/ui/title";
import useSave from "@/hook/use-save";
import { cn } from "@/lib/utils";

type Books = {
    id: string;
    title: string;
    cover: string;
    themes: string[];
    age: string;
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

type ThemesScrollerProps = {
    activeThemes: string[];
    handleThemeToggle: (theme: string) => void;
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
    const tMessages = useTranslations("messages");
    const q = useSearchParams().get("q");
    const [search, setSearch] = useState(q || "");
    const [books, setBooks] = useState<Books>(allBooks);
    const [activeThemes, setActiveThemes] = useState<string[]>([]);
    const [activeAge, setActiveAge] = useState<string | null>(null);
    const [activeArtStyle, setActiveArtStyle] = useState<string | null>(null);
    const [allSavedBooks, setAllSavedBooks] = useState<string[]>(
        user?.savedBooks || []
    );
    const toggleSave = useSave();

    const handleSave = async (bookId: string) => {
        if (!user) {
            toast(tMessages("login-save"), {
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

    const handleSearch = useCallback(() => {
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
                return activeThemes.every((theme) =>
                    book.themes.includes(theme)
                );
            });
        }

        if (activeAge) {
            filteredBooks = filteredBooks.filter(
                (book) => book.age === activeAge
            );
        }

        if (activeArtStyle) {
            filteredBooks = filteredBooks.filter(
                (book) => book.artStyle === activeArtStyle
            );
        }

        setBooks(filteredBooks);
    }, [allBooks, search, activeThemes, activeAge, activeArtStyle]);

    const handleThemeToggle = (theme: string) => {
        setActiveThemes((prev) => {
            const newThemes =
                prev.includes(theme) ?
                    prev.filter((t) => t !== theme)
                :   [...prev, theme];
            return newThemes;
        });
    };

    const handleAge = (age: string) => {
        setActiveAge((prev) => (prev === age ? null : age));
    };

    const handleArtStyleSelect = (artStyle: string) => {
        setActiveArtStyle((prev) => (prev === artStyle ? null : artStyle));
    };

    useEffect(() => {
        handleSearch();
    }, [activeThemes, activeAge, activeArtStyle, search, handleSearch]);

    return (
        <>
            <div className="text-center mb-6">
                <Title
                    text={search || t("title-save")}
                    className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 w-min mx-auto"
                    underline
                />
                <p className="text-neutral text-base md:text-lg max-w-2xl mx-auto">
                    {t("subtitle")}
                </p>
            </div>

            <div className="w-full max-w-md mb-4 mx-auto">
                <div className="w-full relative bg-black/70 h-10 sm:h-12 mr-2 rounded-full overflow-hidden shadow transition duration-200">
                    <div className="absolute left-1.5 sm:left-2 top-1/2 z-50 -translate-y-1/2 size-9 flex items-center justify-center">
                        <SearchIcon className="size-6 text-white" />
                    </div>
                    <input
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                        type="text"
                        placeholder={t("search-placeholder")}
                        className="w-full relative text-sm sm:text-base z-50 border-none bg-transparent text-white h-full rounded-full focus:outline-none focus:ring-0 pl-10 sm:pl-12"
                    />
                </div>
            </div>

            <div className="w-full mb-4">
                <ThemesScroller
                    activeThemes={activeThemes}
                    handleThemeToggle={handleThemeToggle}
                />

                <div className="w-full flex items-center justify-between gap-4 flex-wrap md:flex-nowrap mt-4">
                    <div className="dropdown">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-soft bg-secondary/10"
                        >
                            <Baby className="size-5" />
                            {t("age")}
                        </div>
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu bg-base-200 rounded-box z-[1] w-40 p-2 shadow-xl border border-base-300 mt-2"
                        >
                            {ageOptions.map((age) => (
                                <li key={age} className="my-1">
                                    <button
                                        onClick={() => handleAge(age)}
                                        className={cn(
                                            "rounded-xl flex items-center justify-start gap-3 transition-all duration-200 active:!bg-secondary/75",
                                            activeAge === age ?
                                                "bg-secondary text-primary-content shadow-md"
                                            :   "hover:bg-secondary/50"
                                        )}
                                    >
                                        <span className="capitalize text-base font-medium">
                                            {age}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div
                        className="mx-auto overflow-x-scroll justify-center gap-2 flex max-[1150px]:hidden"
                        style={{ overscrollBehaviorY: "none" }}
                    >
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
                            <Paintbrush className="size-5" />
                            {t("art-style")}
                        </div>
                        <ul
                            tabIndex={0}
                            className="dropdown-content menu bg-base-200 rounded-box z-[1] w-64 p-2 shadow-xl border border-base-300 mt-2"
                        >
                            {artStyleOptions.map((artStyle) => (
                                <li key={artStyle} className="my-1">
                                    <button
                                        onClick={() =>
                                            handleArtStyleSelect(artStyle)
                                        }
                                        className={cn(
                                            "rounded-xl flex items-center justify-start gap-3 px-3 py-2 transition-all duration-200 active:!bg-secondary/75",
                                            activeArtStyle === artStyle ?
                                                "bg-secondary text-primary-content shadow-md"
                                            :   "hover:bg-secondary/50"
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
                                        isCover
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

const ThemesScroller: React.FC<ThemesScrollerProps> = ({
    activeThemes,
    handleThemeToggle,
}) => {
    const t = useTranslations("pages.search");
    const scrollerRef = useRef<HTMLDivElement | null>(null);

    const scrollBy = (delta: number) => {
        const el = scrollerRef.current;
        if (!el) return;
        el.scrollBy({ left: delta, behavior: "smooth" });
    };

    const STEP = 240;

    return (
        <div className="relative hidden max-[1150px]:block w-min mx-auto">
            <button
                type="button"
                aria-label="Scroll left"
                onClick={() => scrollBy(-STEP)}
                className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 z-10 h-full pr-4",
                    "from-base-100 from-30% to-transparent bg-gradient-to-r"
                )}
            >
                <ChevronLeft className="size-8 text-neutral" />
            </button>

            <button
                type="button"
                aria-label="Scroll right"
                onClick={() => scrollBy(STEP)}
                className={cn(
                    "absolute right-0 top-1/2 -translate-y-1/2 z-10 h-full pl-4",
                    "from-base-100 from-30% to-transparent bg-gradient-to-l"
                )}
            >
                <ChevronRight className="size-8 text-neutral" />
            </button>

            <div
                ref={scrollerRef}
                className="overflow-x-scroll max-w-[calc(100vw-32px)] flex px-6"
                style={{ overscrollBehaviorY: "none" }}
            >
                {themesOptions.map((theme) => (
                    <button
                        key={theme}
                        onClick={() => handleThemeToggle(theme)}
                        className={cn(
                            "btn gap-2 mx-0.5",
                            activeThemes.includes(theme) ? "btn-secondary" : ""
                        )}
                    >
                        <span className="text-lg">{themeImages[theme]}</span>
                        {t(theme)}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Search;
