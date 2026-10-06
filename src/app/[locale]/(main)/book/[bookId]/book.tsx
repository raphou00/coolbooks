"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { redirect } from "next/navigation";
import { motion, useMotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import saveAs from "file-saver";
import { cn, requestAPI, sortPages } from "@/lib/utils";
import Title from "@/components/ui/title";
import NextImage from "@/components/ui/image";
import DeleteBook from "@/components/ui/delete-book";

type Page = {
    id: string;
    number: number;
    text: string;
    color: string;
    image: string;
};

type BookProps = {
    book: {
        id: string;
        title: string;
        cover: string;
        pages: Page[];
    };
    canDelete: boolean;
};

type PagesProps = {
    pages: Page[];
    imgIndex: number;
};

const DRAG_BUFFER = 25;

const SPRING_OPTIONS = {
    type: "spring",
    mass: 3,
    stiffness: 400,
    damping: 50,
};

const Book: React.FC<BookProps> = ({ book, canDelete }) => {
    const t = useTranslations("pages.book");
    const tMessages = useTranslations("messages");
    const [imgIndex, setImgIndex] = useState(0);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [open, setOpen] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const pages: Page[] = [
        { id: "cover", image: book.cover, text: "", color: "", number: -1 },
        ...book.pages,
    ];

    const dragX = useMotionValue(0);

    const onDragEnd = () => {
        const x = dragX.get();

        if (x <= -DRAG_BUFFER && imgIndex < pages.length - 1) {
            setImgIndex((pv) => pv + 1);
        } else if (x >= DRAG_BUFFER && imgIndex > 0) {
            setImgIndex((pv) => pv - 1);
        }
    };

    const exportPDF = async () => {
        if (loadingPdf) return;
        try {
            setLoadingPdf(true);

            const blob = await requestAPI(
                "GET",
                `/api/book/export?bookId=${book.id}`,
                null,
                {},
                "blob"
            );

            saveAs(blob as unknown as Blob, `${book.title}.pdf`);
            setLoadingPdf(false);
        } catch (err) {
            console.error(err);
            toast.error(tMessages("server-error"));
            setLoadingPdf(false);
        }
    };

    const handlePrev = () => {
        setImgIndex((pv) => Math.max(0, pv - 1));
    };

    const handleNext = () => {
        setImgIndex((pv) => Math.min(pages.length - 1, pv + 1));
    };

    return (
        <>
            {canDelete && (
                <DeleteBook
                    bookId={book.id}
                    callback={() => redirect("/my-books")}
                    open={open}
                    setOpen={setOpen}
                />
            )}
            <div className="w-full max-w-[850px] px-2 flex items-center justify-between mt-4 mx-auto">
                <div className="flex flex-col">
                    <Title text={book.title} className="font-bold text-xl" />
                </div>

                <div className="flex gap-2">
                    {canDelete && (
                        <button
                            onClick={() => setOpen(true)}
                            className="btn btn-circle btn-error btn-soft"
                            title={t("delete")}
                        >
                            <Trash2 className="size-6" />
                        </button>
                    )}
                    <button
                        onClick={exportPDF}
                        className="btn btn-circle btn-primary"
                        title={t("download-pdf")}
                        disabled={loadingPdf}
                    >
                        {loadingPdf ?
                            <div className="loading" />
                        :   <Download className="size-6" />}
                    </button>
                </div>
            </div>

            <div ref={containerRef} className="relative overflow-hidden mt-4">
                <motion.div
                    drag="x"
                    dragConstraints={{
                        left: 0,
                        right: 0,
                    }}
                    style={{
                        x: dragX,
                    }}
                    animate={{
                        translateX: `-${imgIndex * 100}%`,
                    }}
                    transition={SPRING_OPTIONS}
                    onDragEnd={onDragEnd}
                    className={cn(
                        "flex items-center",
                        "cursor-grab active:cursor-grabbing"
                    )}
                >
                    <Pages pages={pages} imgIndex={imgIndex} />
                </motion.div>
            </div>

            <div className="mx-auto w-fit flex items-center justify-between gap-x-4 mt-6">
                <button
                    className="btn btn-circle flex items-center gap-1"
                    onClick={handlePrev}
                    disabled={imgIndex === 0}
                >
                    <ChevronLeft className="size-5" />
                </button>
                <div className="flex w-full justify-center gap-2">
                    {Array.from({ length: pages.length }).map((_, idx) => {
                        return (
                            <button
                                key={idx}
                                onClick={() => setImgIndex(idx)}
                                className={cn(
                                    "h-3 w-3 rounded-full transition-colors",
                                    idx === imgIndex ? "bg-primary" : (
                                        "bg-accent"
                                    )
                                )}
                                aria-label={`Go to page ${idx + 1}`}
                            />
                        );
                    })}
                </div>
                <button
                    className="btn btn-circle flex items-center gap-1"
                    onClick={handleNext}
                    disabled={imgIndex === pages.length - 1}
                >
                    <ChevronRight className="size-5" />
                </button>
            </div>
        </>
    );
};

const Pages: React.FC<PagesProps> = ({ pages }) => {
    return (
        <>
            {sortPages(pages).map((page, idx) => {
                return (
                    <motion.div
                        key={idx}
                        transition={SPRING_OPTIONS}
                        className={cn(
                            "w-full shrink-0 rounded-xl object-cover"
                        )}
                    >
                        <div className="flex flex-col md:flex-row items-center justify-center min-w-full gap-4 snap-center">
                            <div
                                className={cn(
                                    "relative aspect-square w-full max-w-[450px]",
                                    idx === 0 ? "max-md:w-full" : (
                                        "max-md:w-[70vw]"
                                    )
                                )}
                            >
                                {page.image !== "" && (
                                    <NextImage
                                        src={page.image}
                                        className="rounded-2xl select-none"
                                        alt={page.text}
                                        width={1024}
                                        height={1024}
                                        isCover={idx == 0}
                                    />
                                )}
                            </div>
                            {page.text && (
                                <div
                                    className="relative flex flex-col justify-center rounded-2xl w-full max-w-[450px] md:aspect-square text-gray-800 max-md:mx-auto"
                                    style={{ background: page.color }}
                                >
                                    <div className="text-xl md:text-2xl leading-relaxed text-justify p-8">
                                        {page.text}
                                    </div>
                                    <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm text-gray-600">
                                        {idx}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </>
    );
};

export default Book;
