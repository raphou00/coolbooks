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
        <div className="space-y-10 pt-22 h-screen">
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
                        😍 {t("beta")}
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
                        className="group relative flex w-fit items-center gap-1.5 rounded-full bg-gray-950/80 px-4 py-2 text-gray-50 transition-colors cursor-pointer hover:bg-gray-950/90"
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

    return (
        <>
            <div className="mb-4">
                <Title
                    text={t("trend") + " 🔥"}
                    className="text-left w-fit text-3xl text-white"
                    underline
                />
            </div>
            <div className="w-full grid grid-cols-3 md:grid-cols-5 gap-2">
                {books.map((book) => (
                    <Link
                        key={book.id}
                        href={`/book/${book.id}`}
                        className="group relative size-full"
                    >
                        <div className="w-full aspect-square shadow-lg rounded-lg overflow-hidden">
                            <NextImage
                                className="group-hover:scale-105 transition-all"
                                src={book.cover}
                                width={1024}
                                height={1024}
                                alt={book.title}
                            />
                        </div>
                        <div className="flex flex-col items-center justify-center text-white text-sm font-bold">
                            <h2 className="text-center">{book.title}</h2>
                            <p className="text-gray-300">
                                {t("by")} {book.user.name}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
};

export const MyBooks: React.FC<BooksProps> = ({ books }) => {
    const t = useTranslations("pages.home");

    return (
        <>
            <div className="mt-8 mb-4">
                <Title
                    text={t("my-books") + " 📖"}
                    className="text-left w-fit text-3xl"
                    underline
                />
            </div>
            <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-2">
                <Link
                    href="/studio/new"
                    className={cn(
                        "flex items-center justify-center bg-gradient-to-tr from-secondary/80 to-primary/80 rounded-lg shadow-lg border-4 border-dashed overflow-hidden",
                        "border-base-200 cursor-pointer hover:bg-base-200 hover:border-base-300 hover:rounded-xl transition-all relative z-20 aspect-square"
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
                        className="group relative size-full"
                    >
                        <div className="w-full aspect-square shadow-lg rounded-lg overflow-hidden">
                            <NextImage
                                className="group-hover:scale-105 transition-all"
                                src={book.cover}
                                width={1024}
                                height={1024}
                                alt={book.title}
                            />
                        </div>
                        <div className="flex flex-col items-center justify-center text-sm font-bold mt-2">
                            <h2 className="text-center">{book.title}</h2>
                        </div>
                    </Link>
                ))}
            </div>
        </>
    );
};
