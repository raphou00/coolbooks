"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Fragment, useEffect, useState } from "react";
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
    const [open, setOpen] = useState<string | null>(null);
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
            <div className="flex items-center justify-between max-md:flex-col mb-8 gap-4">
                <div className="text-center w-fit">
                    <Title
                        text={t("title")}
                        className="text-3xl lg:text-4xl font-bold w-fit"
                        underline
                    />
                </div>

                <div className="w-full max-w-sm">
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
                    <div className="group relative size-full">
                        <Link href="/studio/new">
                            <div className="w-full bg-base-300 aspect-square shadow-lg rounded-lg group-hover:rounded-xl border-4 border-neutral border-dashed flex justify-center items-center">
                                <BookPlus className="size-10 md:size-16 group-hover:scale-125 transition-all text-black/80" />
                            </div>
                            <div className="text-center font-bold mt-2">
                                <h2 className="truncate w-full">
                                    {t("create")}
                                </h2>
                            </div>
                        </Link>
                    </div>
                    {books.map((book) => (
                        <Fragment key={book.id}>
                            <DeleteBook
                                bookId={book.id}
                                callback={() =>
                                    setBooks(
                                        books.filter((b) => b.id !== book.id)
                                    )
                                }
                                open={open === book.id}
                                setOpen={(isOpen) =>
                                    setOpen(isOpen ? book.id : null)
                                }
                            />
                            <div className="group relative size-full">
                                <div className="absolute z-50 top-2 right-2 transition opacity-0 group-hover:opacity-100">
                                    <button
                                        className="btn btn-sm btn-circle btn-soft btn-error"
                                        onClick={() => setOpen(book.id)}
                                    >
                                        <Trash2 className="size-5" />
                                    </button>
                                </div>

                                <Link href={`/book/${book.id}`}>
                                    <div className="w-full aspect-square shadow-lg rounded-lg overflow-hidden">
                                        <NextImage
                                            className=""
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
                                        <p className="text-neutral text-xs text-left truncate w-full">
                                            {t("modify")}{" "}
                                            <Date date={book.updatedAt} />
                                        </p>
                                    </div>
                                </Link>
                            </div>
                        </Fragment>
                    ))}
                </div>
            }
        </>
    );
};

export default Studio;
