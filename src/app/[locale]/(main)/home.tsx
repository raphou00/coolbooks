"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import {
    useMotionTemplate,
    useMotionValue,
    motion,
    animate,
} from "framer-motion";
import { ArrowRight, PlusSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import NextImage from "@/components/ui/image";
import Title from "@/components/ui/title";
import { title } from "@/config/seo";
import { cn } from "@/lib/utils";

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

const COLORS_TOP = ["#FF9AA2", "#FFB347", "#87CEEB", "#98FB98", "#DDA0DD"];

export const Home: React.FC<BooksProps> = ({ books }) => {
    const t = useTranslations("pages.home");
    const color = useMotionValue(COLORS_TOP[0]);

    useEffect(() => {
        animate(color, COLORS_TOP, {
            ease: "easeInOut",
            duration: 10,
            repeat: Infinity,
            repeatType: "mirror",
        });
    }, []);

    const border = useMotionTemplate`1px solid ${color}`;
    const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

    return (
        <div className="space-y-24">
            <Image
                src="/images/magical-forest-kid-reading-a-book-fantastic.png"
                alt=""
                className="absolute top-0 left-0 object-cover w-screen h-screen -z-50 brightness-50"
                width={1920}
                height={1080}
            />

            <section className="relative grid place-content-center">
                <div className="relative z-10 flex flex-col items-center">
                    <span className="inline-block rounded-full bg-neutral/20 backdrop-blur border border-neutral px-3 py-1.5 mb-3 text-sm text-white">
                        {t("beta")}
                    </span>
                    <Title
                        text={title}
                        className="text-7xl mx-auto w-fit text-center font-bold text-white"
                        underline
                    />
                    <p className="my-6 max-w-xl text-center text-base leading-relaxed md:text-lg md:leading-relaxed text-white">
                        {t("description")}
                    </p>
                    <motion.button
                        style={{
                            border,
                            boxShadow,
                        }}
                        whileHover={{
                            scale: 1.015,
                        }}
                        whileTap={{
                            scale: 0.985,
                        }}
                        className="group relative flex w-fit items-center gap-1.5 rounded-full bg-gray-950/60 px-4 py-2 text-gray-50 transition-colors cursor-pointer hover:bg-gray-950/50"
                    >
                        {t("free-trial")}
                        <ArrowRight className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" />
                    </motion.button>
                </div>
            </section>

            <Books books={books} />
        </div>
    );
};

const Books: React.FC<BooksProps> = ({ books }) => {
    const t = useTranslations("pages.home");
    const phantomBooks = Array.from({ length: 0 });

    return (
        <>
            <div className="mb-4">
                <Title text="" className="text-left w-fit text-xl" />
            </div>
            <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-2">
                <Link
                    href="/studio/new"
                    className={cn(
                        "flex items-center justify-center bg-gradient-to-tr from-secondary/80 to-primary/80 rounded-lg shadow-lg border-4 border-dashed overflow-hidden",
                        "border-base-200 cursor-pointer hover:bg-base-200 hover:border-base-300 hover:rounded-xl transition-all relative z-20"
                    )}
                >
                    <div className="flex flex-col items-center justify-center gap-2 bg-black/50 size-full">
                        <PlusSquare className="size-8 md:size-12 text-white" />
                        <h2 className="text-sm text-white">{t("new-book")}</h2>
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
                        className="bg-base-300 aspect-square rounded-lg shadow-lg border-2 border-neutral"
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
