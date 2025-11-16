"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import {
    Bookmark,
    ChevronLeftIcon,
    ChevronRightIcon,
    Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Title from "./title";
import NextImage from "./image";
import type { User } from "lucia";
import toast from "react-hot-toast";

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
    user: User | null;
};

const Books: React.FC<BooksProps> = ({ title, books, user }) => {
    const t = useTranslations("pages.home");
    const tLoginSave = useTranslations("links");
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

    const handleSave = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!user) {
            toast(tLoginSave("login-save"), {
                icon: <Info className="text-info" />,
            });
            return;
        }
    };

    // const handleSave = async (user: User | null, bookId: string) => {
    //     if (!user) {
    //         toast(t("messages.login-save"), {
    //             icon: <Info className="text-info" />,
    //         });
    //     }

    //     setIsLiking((prev) => ({ ...prev, [mediaId]: true }));

    //     const isCurrentlyLiked = user?.savedBooks.has(mediaId);
    //     const newLikedMedias = new Set(likedMedias);

    //     if (isCurrentlyLiked) {
    //         newLikedMedias.delete(mediaId);
    //         setLikeCounts((prev) => ({
    //             ...prev,
    //             [mediaId]: prev[mediaId] - 1,
    //         }));
    //     } else {
    //         newLikedMedias.add(mediaId);
    //         setLikeCounts((prev) => ({
    //             ...prev,
    //             [mediaId]: prev[mediaId] + 1,
    //         }));
    //     }

    //     setLikedMedias(newLikedMedias);

    //     try {
    //         const response = await fetch("/api/book/save", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify({
    //                 bookId,
    //                 action: isCurrentlySaved ? "unsave" : "save",
    //             }),
    //         });

    //         if (!response.ok) {
    //             throw new Error("Failed to update like");
    //         }

    //         const data = await response.json();

    //         setLikeCounts((prev) => ({ ...prev, [mediaId]: data.likes }));
    //     } catch (error) {
    //         console.error("Error updating like:", error);

    //         if (isCurrentlyLiked) {
    //             newLikedMedias.add(mediaId);
    //             setLikeCounts((prev) => ({
    //                 ...prev,
    //                 [mediaId]: prev[mediaId] + 1,
    //             }));
    //         } else {
    //             newLikedMedias.delete(mediaId);
    //             setLikeCounts((prev) => ({
    //                 ...prev,
    //                 [mediaId]: prev[mediaId] - 1,
    //             }));
    //         }
    //         setLikedMedias(newLikedMedias);
    //     } finally {
    //         setIsLiking((prev) => ({ ...prev, [mediaId]: false }));
    //     }
    // };

    return (
        <section className="mt-12">
            <div className="mb-4">
                <Title
                    text={title}
                    className="text-left w-fit text-2xl font-bold sm:text-3xl md:text-4xl"
                />
            </div>
            <div className="relative group">
                <button
                    onClick={() => scrollContainer("left")}
                    disabled={!canScrollLeft}
                    className={`
                        absolute left-0 top-2/5 -translate-y-1/2 z-50
                        bg-black/90 hover:from-black/95
                        text-white p-4 rounded-full ml-3 cursor-pointer
                        transition-all duration-200
                        ${canScrollLeft ? "hidden group-hover:block" : "hidden cursor-not-allowed"}
                        disabled:hidden
                    `}
                >
                    <ChevronLeftIcon className="size-6" />
                </button>
                <button
                    onClick={() => scrollContainer("right")}
                    disabled={!canScrollRight}
                    className={`
                        absolute right-0 top-2/5 -translate-y-1/2 z-50
                        bg-black/90 hover:from-black/95
                        text-white p-4 rounded-full mr-3 cursor-pointer
                        transition-all duration-200
                        ${canScrollRight ? "hidden group-hover:block" : "hidden cursor-not-allowed"}
                        disabled:hidden
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
                        <div
                            key={book.id}
                            className="relative flex-shrink-0 w-44 md:w-56 lg:w-60 xl:w-64"
                        >
                            <button
                                className="absolute right-0 bottom-15 z-60 bg-primary/95 rounded-l-full pl-2 pr-3 py-1 max-md:hidden cursor-pointer"
                                onClick={handleSave}
                            >
                                <Bookmark
                                    className={cn(
                                        "size-6 text-white",
                                        "fill-whit2"
                                    )}
                                />
                            </button>
                            <Link href={`/book/${book.id}`}>
                                <div className="relative aspect-square shadow-lg rounded-2xl overflow-hidden">
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
            </div>
        </section>
    );
};

export default Books;
