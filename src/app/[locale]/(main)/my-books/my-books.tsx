/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Fragment, useEffect, useState } from "react";
import { Download, Plus, SearchIcon, Trash2 } from "lucide-react";
import saveAs from "file-saver";
import toast from "react-hot-toast";
import { requestAPI } from "@/lib/utils";
import NextImage from "@/components/ui/image";
import Title from "@/components/ui/title";
import Date from "@/components/ui/date";
import DeleteBook from "@/components/ui/delete-book";
import FormInput from "@/components/ui/form-input";

type Books = {
    id: string;
    title: string;
    cover: string;
    createdAt: Date;
}[];

type MyBooksProps = {
    books: Books;
};

const MyBooks: React.FC<MyBooksProps> = ({ books: allBooks }) => {
    const t = useTranslations("pages.my-books");
    const tMessages = useTranslations("messages");
    const [open, setOpen] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [books, setBooks] = useState<Books>(allBooks);
    const [loadingPdf, setLoadingPdf] = useState<boolean>(false);

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

    const downloadPdf = async (bookId: string, bookTitle: string) => {
        if (loadingPdf) return;
        try {
            setLoadingPdf(true);

            const blob = await requestAPI(
                "GET",
                `/api/book/export?bookId=${bookId}`,
                null,
                {},
                "blob"
            );

            saveAs(blob as unknown as Blob, `${bookTitle}.pdf`);
            setLoadingPdf(false);
        } catch (err) {
            console.error(err);
            toast.error(tMessages("server-error"));
            setLoadingPdf(false);
        }
    };

    return (
        <>
            <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <Title text={t("title")} className="type-display-md" />

                <div className="relative w-full md:max-w-xs">
                    <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-muted" />
                    <FormInput
                        type="search"
                        name="search"
                        label=""
                        placeholder={t("search-placeholder")}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 xl:grid-cols-5">
                <Link href="/new" className="group block">
                    <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border-strong bg-surface-soft text-ink active:bg-surface-strong">
                        <span className="flex size-10 items-center justify-center rounded-full bg-ink text-canvas">
                            <Plus className="size-5" />
                        </span>
                        <span className="type-label px-2 text-center">
                            {t("create")}
                        </span>
                    </div>
                </Link>

                {books.map((book) => (
                    <Fragment key={book.id}>
                        <DeleteBook
                            bookId={book.id}
                            callback={() =>
                                setBooks(books.filter((b) => b.id !== book.id))
                            }
                            open={open === book.id}
                            setOpen={(isOpen) =>
                                setOpen(isOpen ? book.id : null)
                            }
                        />
                        <div className="min-w-0">
                            <Link href={`/book/${book.id}`} className="block">
                                <div className="aspect-square w-full overflow-hidden rounded-md bg-surface-soft">
                                    <NextImage
                                        src={book.cover}
                                        width={1024}
                                        height={1024}
                                        alt={book.title}
                                        isCover
                                    />
                                </div>
                            </Link>
                            <div className="mt-3 flex items-start justify-between gap-2">
                                <Link
                                    href={`/book/${book.id}`}
                                    className="min-w-0 flex-1"
                                >
                                    <h2 className="type-label text-ink line-clamp-2">
                                        {book.title}
                                    </h2>
                                    <p className="type-body mt-0.5 text-muted">
                                        {t("modify")}{" "}
                                        <Date date={book.createdAt} />
                                    </p>
                                </Link>
                                <div className="flex shrink-0 gap-1">
                                    <button
                                        className="button-icon size-8!"
                                        onClick={() =>
                                            downloadPdf(book.id, book.title)
                                        }
                                        aria-label="Download PDF"
                                        disabled={loadingPdf}
                                    >
                                        <Download className="size-3.5" />
                                    </button>
                                    <button
                                        className="button-icon size-8! text-error!"
                                        onClick={() => setOpen(book.id)}
                                        aria-label="Delete"
                                    >
                                        <Trash2 className="size-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Fragment>
                ))}
            </div>

            {books.length === 0 && (
                <p className="type-body-lg mt-10 text-muted">{t("no-books")}</p>
            )}
        </>
    );
};

export default MyBooks;
