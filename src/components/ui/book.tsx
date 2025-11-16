"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useMotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { cn, sortPages } from "@/lib/utils";
import NextImage from "@/components/ui/image";
import Title from "./title";

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
    imgIndex: number;
    fullscreen: boolean;
};

type NavigationProps = {
    pages: Page[];
    imgIndex: number;
    setImgIndex: React.Dispatch<React.SetStateAction<number>>;
};

const DRAG_BUFFER = 50;

const SPRING_OPTIONS = {
    type: "spring",
    mass: 3,
    stiffness: 400,
    damping: 50,
};

const Book: React.FC<BookProps> = ({ book }) => {
    const t = useTranslations("pages.book");
    const [imgIndex, setImgIndex] = useState(0);
    const [showFullscreen, setShowFullscreen] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const allPages = [
        {
            number: -1,
            id: "",
            text: "",
            color: "",
            image: book.cover,
        },
        ...book.pages,
    ];

    const dragX = useMotionValue(0);

    const onDragEnd = () => {
        const x = dragX.get();

        if (x <= -DRAG_BUFFER && imgIndex < allPages.length - 1) {
            setImgIndex((pv) => pv + 1);
        } else if (x >= DRAG_BUFFER && imgIndex > 0) {
            setImgIndex((pv) => pv - 1);
        }
    };

    useEffect(() => {
        const handleChange = () => {
            const isFs = Boolean(document.fullscreenElement);
            setShowFullscreen(isFs);
        };
        document.addEventListener("fullscreenchange", handleChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleChange);
        };
    }, []);

    const enterFullscreen = async () => {
        try {
            const el = containerRef.current ?? document.documentElement;
            if (document.fullscreenElement) return;
            await el.requestFullscreen();
        } catch (e) {
            console.error("Failed to enter fullscreen:", e);
        }
    };

    const exitFullscreen = async () => {
        try {
            if (!document.fullscreenElement) return;
            await document.exitFullscreen();
        } catch (e) {
            console.error("Failed to exit fullscreen:", e);
        }
    };

    const toggleFullscreen = () => {
        if (document.fullscreenElement) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    };

    return (
        <>
            <div className="w-full max-w-[850px] flex items-center justify-between mt-4 mx-auto">
                <Title text={book.title} className="font-bold text-xl" />

                <div className="flex gap-2">
                    <button
                        onClick={toggleFullscreen}
                        className="btn btn-circle btn-primary"
                        title={showFullscreen ? t("minimize") : t("maximize")}
                    >
                        {showFullscreen ?
                            <Minimize2 className="size-6" />
                        :   <Maximize2 className="size-6" />}
                    </button>
                </div>
            </div>

            <div
                ref={containerRef}
                className={cn(
                    "relative overflow-hidden mt-4",
                    showFullscreen &&
                        "fixed inset-0 z-50 bg-base-100 p-0 flex flex-col"
                )}
            >
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
                        "flex cursor-grab items-center active:cursor-grabbing",
                        showFullscreen && "flex-1"
                    )}
                >
                    <Pages
                        pages={allPages}
                        imgIndex={imgIndex}
                        fullscreen={showFullscreen}
                    />
                </motion.div>

                <div className={cn(showFullscreen && "mt-4")}>
                    <Navigation
                        pages={allPages}
                        imgIndex={imgIndex}
                        setImgIndex={setImgIndex}
                    />
                </div>

                {showFullscreen && (
                    <button
                        onClick={exitFullscreen}
                        className="btn btn-circle btn-primary fixed top-4 right-4"
                        title={t("minimize")}
                    >
                        <Minimize2 className="size-6" />
                    </button>
                )}
            </div>
        </>
    );
};

const Pages: React.FC<PagesProps> = ({ pages, fullscreen }) => {
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
                        {fullscreen ?
                            <div className="min-w-full h-screen snap-center flex justify-center">
                                <div className="w-1/2 h-full flex items-center justify-center">
                                    <div
                                        className="aspect-square"
                                        style={{
                                            width: "min(50vw, 100vh)",
                                            height: "min(50vw, 100vh)",
                                        }}
                                    >
                                        {page.image !== "" && (
                                            <NextImage
                                                src={page.image}
                                                className={cn(
                                                    "select-none h-full w-full object-cover",
                                                    page.text === "" &&
                                                        "rounded-2xl"
                                                )}
                                                alt={page.text}
                                                width={1024}
                                                height={1024}
                                            />
                                        )}
                                    </div>
                                </div>
                                {page.text && (
                                    <div className="w-1/2 h-full flex items-center justify-center">
                                        <div
                                            className="aspect-square overflow-hidden text-gray-800"
                                            style={{
                                                width: "min(50vw, 100vh)",
                                                height: "min(50vw, 100vh)",
                                                background: page.color,
                                            }}
                                        >
                                            <div className="h-full w-full p-8 overflow-auto flex items-center justify-center">
                                                <div className="text-lg md:text-xl leading-relaxed text-justify">
                                                    {page.text}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        :   <div className="flex flex-col md:flex-row items-center justify-center min-w-full gap-4 snap-center">
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
                                        />
                                    )}
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
                        }
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
        setImgIndex((pv) => Math.max(0, pv - 1));
    };

    const handleNext = () => {
        setImgIndex((pv) => Math.min(pages.length - 1, pv + 1));
    };

    return (
        <div className="mx-auto w-fit flex items-center justify-between gap-x-4 mt-6">
            <button
                className="btn btn-lg max-md:btn-circle flex items-center gap-1"
                onClick={handlePrev}
                disabled={imgIndex === 0}
            >
                <ChevronLeft className="size-5" />
                <span className="max-md:hidden">{t("prev")}</span>
            </button>
            <div className="flex w-full justify-center gap-2">
                {Array.from({ length: pages.length }).map((_, idx) => {
                    return (
                        <button
                            key={idx}
                            onClick={() => setImgIndex(idx)}
                            className={cn(
                                "h-3 w-3 rounded-full transition-colors",
                                idx === imgIndex ? "bg-primary" : "bg-accent"
                            )}
                            aria-label={`Go to page ${idx + 1}`}
                        />
                    );
                })}
            </div>
            <button
                className="btn btn-lg max-md:btn-circle flex items-center gap-1"
                onClick={handleNext}
                disabled={imgIndex === pages.length - 1}
            >
                <span className="max-md:hidden">{t("next")}</span>
                <ChevronRight className="size-5" />
            </button>
        </div>
    );
};

export default Book;
