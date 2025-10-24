"use client";

import { cn } from "@/lib/utils";
import NextImage from "@/components/ui/image";
import { useRef, useState } from "react";
import { ImageMinus } from "lucide-react";

type BookProps = {
    book: {
        title: string;
        cover: string;
        promptImage: string | null;
        promptText: string;
        pages: {
            text: string;
            color: string;
            images: {
                src: string;
                width: number;
                height: number;
            }[];
        }[];
    };
};

const PAGE_WIDTH = 800;

const Book: React.FC<BookProps> = ({ book }) => {
    const bookRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const pageDesign =
        "flex justify-center items-center !size-[400px] rounded-lg shadow-lg overflow-hidden";

    const scrollToPage = (pageIdx: number) => {
        if (!bookRef.current) return;
        bookRef.current.scrollTo({
            left: pageIdx * PAGE_WIDTH,
            behavior: "smooth",
        });
    };

    const handleNext = () => {
        if (currentPage < book.pages.length) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            scrollToPage(nextPage);
        }
    };

    const handlePrev = () => {
        if (currentPage > 0) {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);
            scrollToPage(prevPage);
        }
    };

    return (
        <>
            <div
                ref={bookRef}
                className="max-w-[810px] mx-auto my-8 flex gap-2 overflow-x-scroll snap-x snap-mandatory"
            >
                <div className="flex justify-center min-w-[810px] snap-center">
                    <div className={cn("py-10 text-center", pageDesign)}>
                        <NextImage
                            src={book.cover}
                            width={1024}
                            height={1024}
                            alt={book.promptText}
                        />
                    </div>
                </div>

                {book.pages.map((page, idx) => (
                    <div
                        key={idx}
                        className="flex flex-row gap-x-2 w-[810px] snap-center"
                    >
                        <div
                            className={cn(
                                "flex-1 flex items-center justify-center",
                                pageDesign
                            )}
                        >
                            {page.images?.[0] ?
                                <NextImage
                                    src={page.images[0].src}
                                    className="size-full rounded shadow"
                                    alt={book.promptText}
                                    width={1024}
                                    height={1024}
                                />
                            :   <div className="w-full h-52 rounded bg-gray-200 flex items-center justify-center text-gray-400">
                                    <ImageMinus className="w-8 h-8" />
                                </div>
                            }
                        </div>

                        <div
                            className={cn(
                                "flex-1 flex items-center p-8 border-8",
                                pageDesign
                            )}
                            style={{
                                background: page.color,
                                borderColor: `${page.color}88`,
                            }}
                        >
                            <div className="text-lg text-gray-800">
                                {page.text}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-center gap-2 mt-4">
                <button
                    className="h-[40px] w-20 border"
                    onClick={handlePrev}
                    disabled={currentPage === 0}
                >
                    {"<"}
                </button>
                <button
                    className="h-[40px] w-20 border"
                    onClick={handleNext}
                    disabled={currentPage === book.pages.length}
                >
                    {">"}
                </button>
            </div>
        </>
    );
};

export default Book;
