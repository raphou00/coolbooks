"use client";

import NextImage from "@/components/ui/image";
import { cn } from "@/lib/utils";
import { PlusSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import Title from "./title";

type BooksProps = {
    books: {
        id: string;
        title: string;
        cover: string;
        user: {
            name: string;
        };
    }[];
};

const Books: React.FC<BooksProps> = ({ books }) => {
    const t = useTranslations("pages.home");
    const phantomBooks = Array.from({ length: 0 });

    return (
        <>
            <div className="mb-4">
                <Title
                    text={t("books")}
                    className="text-left w-fit text-xl"
                    underline
                />
            </div>
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-2">
                <Link
                    href="/studio/new"
                    className={cn(
                        "flex items-center justify-center bg-gradient-to-tr from-secondary/20 to-primary/10 rounded-lg shadow-lg border-4 border-dashed overflow-hidden",
                        "border-neutral cursor-pointer hover:bg-base-200 hover:border-base-content hover:rounded-xl transition-all relative z-20"
                    )}
                >
                    <div className="flex flex-col items-center justify-center gap-2">
                        <PlusSquare className="size-8 md:size-12" />
                        <h2 className="text-sm">{t("new-book")}</h2>
                    </div>
                </Link>
                {books.map((book) => (
                    <Link
                        key={book.id}
                        href={`/book/${book.id}`}
                        className="group relative size-full rounded-lg shadow-lg overflow-hidden border-2 border-neutral"
                    >
                        <NextImage
                            className="group-hover:scale-105 transition-all"
                            src={book.cover}
                            width={1024}
                            height={1024}
                            alt={book.title}
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                            <h2 className="text-white text-center text-xl font-bold max-w-3/4">
                                {book.title}
                            </h2>
                        </div>
                    </Link>
                ))}

                {phantomBooks.map((_, index) => (
                    <div
                        key={index}
                        className="bg-neutral/10 rounded-lg shadow-lg border-2 border-neutral"
                    >
                        <div className="size-full flex flex-col items-center justify-center gap-2">
                            <Image
                                src="/images/book-smiley.svg"
                                alt="Book simley"
                                width={256}
                                height={256}
                                className="filter grayscale-100 w-1/2"
                            />
                            <h2 className="text-neutral text-sm text-center">
                                {t("next-book")}
                            </h2>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default Books;
