"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Bookmark, Info, SearchIcon } from "lucide-react";
import NextImage from "@/components/ui/image";
import Title from "@/components/ui/title";
import type { User } from "lucia";
import toast from "react-hot-toast";
import useSave from "@/hook/use-save";
import { cn } from "@/lib/utils";

type Books = {
    id: string;
    title: string;
    cover: string;
    user: {
        name: string;
    };
    updatedAt: Date;
}[];

type FavoritesProps = {
    books: Books;
    user: User;
};

const Favorites: React.FC<FavoritesProps> = ({ user, books: allBooks }) => {
    const t = useTranslations("pages.favorites");
    const tLoginSave = useTranslations("links");
    const [value, setValue] = useState("");
    const [books, setBooks] = useState<Books>(allBooks);
    const [allSavedBooks, setAllSavedBooks] = useState<string[]>(
        user.savedBooks || []
    );
    const toggleSave = useSave();

    const onSubmit = () => {
        const filteredBooks = allBooks.filter((book) =>
            book.title.toLowerCase().includes(value.toLowerCase())
        );
        setBooks(filteredBooks);
    };

    const handleKeyDown = () => {
        onSubmit();
    };

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

    return (
        <div className="mt-4">
            <div className="flex items-center justify-between max-md:flex-col mb-8">
                <Title
                    text={"💘 " + t("title")}
                    className="text-3xl w-fit"
                    underline
                />

                <div className="max-md:mt-4 w-full md:max-w-md">
                    <div className="w-full relative bg-black/70 h-12 mr-2 rounded-full overflow-hidden shadow transition duration-200">
                        <input
                            onChange={(e) => setValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            value={value}
                            type="text"
                            placeholder={t("search-placeholder")}
                            className="w-full relative text-sm sm:text-base z-50 border-none bg-transparent text-white h-full rounded-full focus:outline-none focus:ring-0 pl-4 sm:pl-6 pr-12"
                        />

                        <button
                            type="submit"
                            onClick={onSubmit}
                            className="absolute right-1.5 top-1/2 z-50 -translate-y-1/2 size-9 rounded-full bg-primary transition duration-200 flex items-center justify-center cursor-pointer"
                        >
                            <SearchIcon className="size-6 text-white" />
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
        </div>
    );
};

export default Favorites;
