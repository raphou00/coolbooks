"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, useMotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn, sortPages } from "@/lib/utils";
import NextImage from "@/components/ui/image";

type Page = {
    id: string;
    number: number;
    text: string;
    color: string;
    image: string;
};

type BookProps = {
    book: {
        title: string;
        cover: string;
        pages: Page[];
    };
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

const DRAG_BUFFER = 50;

const SPRING_OPTIONS = {
    type: "spring",
    mass: 3,
    stiffness: 400,
    damping: 50,
};

const Book: React.FC<BookProps> = ({ book }) => {
    const [imgIndex, setImgIndex] = useState(0);

    const dragX = useMotionValue(0);

    const onDragEnd = () => {
        const x = dragX.get();

        if (x <= -DRAG_BUFFER && imgIndex < book.pages.length - 1) {
            setImgIndex((pv) => pv + 1);
        } else if (x >= DRAG_BUFFER && imgIndex > 0) {
            setImgIndex((pv) => pv - 1);
        }
    };

    return (
        <div className="relative overflow-hidden mt-8">
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
