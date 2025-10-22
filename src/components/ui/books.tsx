"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Title from "./title";
import NextImage from "./image";

type BooksProps = {
    title: string;
    books: {
        id: string;
        title: string;
        cover: string;
        user?: {
            name: string;
        };
    }[];
};

const Books: React.FC<BooksProps> = ({ title, books }) => {
    const t = useTranslations("pages.home");
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const scrollContainer = (direction: "left" | "right") => {
        const container = scrollRef.current;
        if (!container) return;

        const scrollAmount = container.clientWidth * 0.8;

        if (direction === "left") {
            container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
        } else {
            container.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    const handleScroll = () => {
        const container = scrollRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;

        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    };

    useEffect(() => {
        handleScroll();
    }, [books]);

    return (
        <section className="mt-10">
            <div className="mb-4">
                <Title
                    text={title}
                    className="text-left w-fit text-4xl"
                    underline
                />
            </div>
            <div className="relative group">
                <button
                    onClick={() => scrollContainer("left")}
                    disabled={!canScrollLeft}
                    className={`
                        absolute left-0 top-2/5 -translate-y-1/2 z-10
                        bg-black/70 hover:from-black/90
                        text-white p-4 rounded-full ml-3
                        transition-all duration-200 backdrop-blur-xl
                        ${canScrollLeft ? "opacity-0 group-hover:opacity-100" : "opacity-0 cursor-not-allowed"}
                        disabled:opacity-0
                    `}
                >
                    <ChevronLeftIcon className="size-6" />
                </button>
                <button
                    onClick={() => scrollContainer("right")}
                    disabled={!canScrollRight}
                    className={`
                        absolute right-0 top-2/5 -translate-y-1/2 z-10
                        bg-black/70 hover:from-black/90
                        text-white p-4 rounded-full mr-3
                        transition-all duration-200 backdrop-blur-xl
                        ${canScrollRight ? "opacity-0 group-hover:opacity-100" : "opacity-0 cursor-not-allowed"}
                        disabled:opacity-0
                    `}
                >
                    <ChevronRightIcon className="size-6" />
                </button>

                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="w-full flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {books.map((book) => (
                        <Link
                            key={book.id}
                            href={`/book/${book.id}`}
                            className="relative flex-shrink-0 w-32 md:w-40 lg:w-56"
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
                                    <p className="text-inherit text-xs text-left truncate w-full">
                                        {t("by")} {book.user.name}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Books;
