"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, useMotionValue } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Edit,
    Maximize2,
    Minimize2,
} from "lucide-react";
import { cn, sortPages } from "@/lib/utils";
import NextImage from "@/components/ui/image";
import Title from "./title";
import Link from "next/link";

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
    isCreator: boolean;
};

type PagesProps = {
    pages: Page[];
    cover: string;
    imgIndex: number;
};

type NavigationProps = {
    pages: Page[];
    imgIndex: number;
    setImgIndex: React.Dispatch<React.SetStateAction<number>>;
};

type FullscreenReaderProps = {
    book: {
        id: string;
        title: string;
        cover: string;
        pages: Page[];
    };
    imgIndex: number;
    setImgIndex: React.Dispatch<React.SetStateAction<number>>;
    onClose: () => void;
};

const DRAG_BUFFER = 50;

const SPRING_OPTIONS = {
    type: "spring",
    mass: 3,
    stiffness: 400,
    damping: 50,
};

const Book: React.FC<BookProps> = ({ book, isCreator }) => {
    const t = useTranslations("pages.book");
    const [imgIndex, setImgIndex] = useState(0);
    const [showFullscreen, setShowFullscreen] = useState(false);

    const dragX = useMotionValue(0);

    const onDragEnd = () => {
        const x = dragX.get();

        if (x <= -DRAG_BUFFER && imgIndex < book.pages.length - 1) {
            setImgIndex((pv) => pv + 1);
        } else if (x >= DRAG_BUFFER && imgIndex > 0) {
            setImgIndex((pv) => pv - 1);
        }
    };

    if (showFullscreen) {
        return (
            <FullscreenReader
                book={book}
                onClose={() => setShowFullscreen(false)}
                imgIndex={imgIndex}
                setImgIndex={setImgIndex}
            />
        );
    }

    return (
        <>
            <div className="w-full max-w-[850px] flex items-center justify-between mt-4 mx-auto">
                <Title text={book.title} className="font-bold text-xl" />

                <div className="flex gap-2">
                    {isCreator && (
                        <Link
                            href={"/studio/" + book.id}
                            className="btn btn-sm btn-secondary"
                        >
                            <Edit className="size-5" />
                            {t("edit")}
                        </Link>
                    )}
                    <button
                        onClick={() => setShowFullscreen(true)}
                        className="btn btn-sm btn-circle btn-primary"
                    >
                        <Maximize2 className="size-5" />
                    </button>
                </div>
            </div>
            <div className="relative overflow-hidden mt-4">
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
                    className="flex cursor-grab items-center active:cursor-grabbing"
                >
                    <Pages
                        pages={book.pages}
                        cover={book.cover}
                        imgIndex={imgIndex}
                    />
                </motion.div>

                <Navigation
                    pages={book.pages}
                    imgIndex={imgIndex}
                    setImgIndex={setImgIndex}
                />
            </div>
        </>
    );
};

const FullscreenReader: React.FC<FullscreenReaderProps> = ({
    book,
    imgIndex,
    setImgIndex,
    onClose,
}) => {
    const dragX = useMotionValue(0);

    const pages = [
        {
            id: "",
            text: "",
            color: "",
            image: book.cover,
            number: 0,
        },
        ...sortPages(book.pages),
    ];

    const onDragEnd = () => {
        const x = dragX.get();

        if (x <= -DRAG_BUFFER && imgIndex < pages.length - 1) {
            setImgIndex((pv) => pv + 1);
        } else if (x >= DRAG_BUFFER && imgIndex > 0) {
            setImgIndex((pv) => pv - 1);
        }
    };

    const handlePrev = () => {
        if (imgIndex > 0) setImgIndex((pv) => pv - 1);
    };

    const handleNext = () => {
        if (imgIndex < pages.length - 1) setImgIndex((pv) => pv + 1);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") handlePrev();
            else if (e.key === "ArrowRight") handleNext();
            else if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [imgIndex, pages.length]);

    // useEffect(() => {
    //     const lockOrientation = async () => {
    //         try {
    //             if (screen.orientation && screen.orientation.lock) {
    //                 await screen.orientation.lock("landscape");
    //             }
    //         } catch (err) {
    //             console.log("Orientation lock not supported");
    //         }
    //     };

    //     lockOrientation();

    //     return () => {
    //         if (screen.orientation && screen.orientation.unlock) {
    //             screen.orientation.unlock();
    //         }
    //     };
    // }, []);

    return (
        <div className="fixed inset-0 z-[999] bg-base-100 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent p-4 flex items-center justify-between">
                <Title
                    text={book.title}
                    className="font-bold text-lg text-white drop-shadow-lg"
                />
                <button
                    onClick={onClose}
                    className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20"
                >
                    <Minimize2 className="size-6" />
                </button>
            </div>

            <div className="h-full w-full overflow-hidden">
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
                    className="flex h-full cursor-grab active:cursor-grabbing"
                >
                    {pages.map((page, idx) => (
                        <div
                            key={idx}
                            className="w-full h-full shrink-0 flex items-center justify-center"
                        >
                            {idx === 0 ?
                                <div className="relative w-full h-full flex items-center justify-center bg-white">
                                    <div className="relative h-full max-h-full aspect-square">
                                        <NextImage
                                            src={page.image}
                                            className="object-contain w-full h-full"
                                            alt={book.title}
                                            width={1024}
                                            height={1024}
                                        />
                                    </div>
                                </div>
                            :   <div className="w-full h-full flex items-stretch bg-white">
                                    <div className="flex-1 flex items-center justify-center bg-white">
                                        <div className="relative h-full max-h-full aspect-square">
                                            <NextImage
                                                src={page.image}
                                                className="object-contain w-full h-full"
                                                alt={page.text}
                                                width={1024}
                                                height={1024}
                                            />
                                        </div>
                                    </div>

                                    {page.text && (
                                        <div
                                            className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative"
                                            style={{ background: page.color }}
                                        >
                                            <div className="max-w-2xl w-full">
                                                <p className="text-base md:text-xl lg:text-2xl leading-relaxed text-justify text-gray-800">
                                                    {page.text}
                                                </p>
                                            </div>
                                            <p className="absolute bottom-4 text-sm text-gray-600">
                                                {idx}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            }
                        </div>
                    ))}
                </motion.div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/50 to-transparent p-4 hidden">
                <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto">
                    <button
                        onClick={handlePrev}
                        disabled={imgIndex === 0}
                        className="btn btn-circle btn-ghost text-white hover:bg-white/20 disabled:opacity-30"
                        aria-label="Previous page"
                    >
                        <ChevronLeft className="size-6" />
                    </button>

                    <div className="flex items-center gap-2 px-4">
                        {pages.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setImgIndex(idx)}
                                className={cn(
                                    "h-2 rounded-full transition-all duration-300",
                                    idx === imgIndex ? "bg-white w-8" : (
                                        "bg-white/40 w-2 hover:bg-white/60"
                                    )
                                )}
                                aria-label={`Go to page ${idx}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={imgIndex === pages.length - 1}
                        className="btn btn-circle btn-ghost text-white hover:bg-white/20 disabled:opacity-30"
                        aria-label="Next page"
                    >
                        <ChevronRight className="size-6" />
                    </button>
                </div>

                <div className="text-center mt-2">
                    <span className="text-white text-sm drop-shadow">
                        {imgIndex + 1} / {pages.length}
                    </span>
                </div>
            </div>
        </div>
    );
};

const Pages: React.FC<PagesProps> = ({ pages, cover, imgIndex }) => {
    pages = [
        {
            id: "",
            text: "",
            color: "",
            image: cover,
            number: 0,
        },
        ...pages,
    ];
    return (
        <>
            {sortPages(pages).map((page, idx) => {
                return (
                    <motion.div
                        key={idx}
                        animate={{
                            scale: imgIndex === idx ? 0.95 : 0.85,
                        }}
                        transition={SPRING_OPTIONS}
                        className="w-full shrink-0 rounded-xl object-cover"
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
                                <NextImage
                                    src={page.image}
                                    className="rounded-2xl select-none"
                                    alt={page.text}
                                    width={1024}
                                    height={1024}
                                />
                                <div className="size-inherit h-full absolute top-0 left-0" />
                            </div>

                            {page.text && (
                                <div
                                    className="relative flex flex-col justify-center rounded-2xl w-full max-w-[450px] md:aspect-square text-gray-800 max-md:mx-auto"
                                    style={{ background: page.color }}
                                >
                                    <div className="text-base md:text-xl leading-relaxed text-justify p-8">
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

const Navigation: React.FC<NavigationProps> = ({
    pages,
    imgIndex,
    setImgIndex,
}) => {
    const t = useTranslations("pages.book");

    const handlePrev = () => {
        setImgIndex((pv) => pv - 1);
    };

    const handleNext = () => {
        setImgIndex((pv) => pv + 1);
    };

    return (
        <div className="mx-auto w-fit flex items-center justify-between gap-x-4">
            <button
                className="btn btn-lg max-md:btn-circle flex items-center gap-1"
                onClick={handlePrev}
                disabled={imgIndex === 0}
            >
                <ChevronLeft className="size-5" />
                <span className="max-md:hidden">{t("prev")}</span>
            </button>
            <div className="flex w-full justify-center gap-2">
                {Array.from({ length: pages.length + 1 }).map((_, idx) => {
                    return (
                        <button
                            key={idx}
                            onClick={() => setImgIndex(idx)}
                            className={cn(
                                "h-3 w-3 rounded-full transition-colors",
                                idx === imgIndex ? "bg-primary" : "bg-accent"
                            )}
                        />
                    );
                })}
            </div>
            <button
                className="btn btn-lg max-md:btn-circle flex items-center gap-1"
                onClick={handleNext}
                disabled={imgIndex === pages.length}
            >
                <span className="max-md:hidden">{t("next")}</span>
                <ChevronRight className="size-5" />
            </button>
        </div>
    );
};

export default Book;
