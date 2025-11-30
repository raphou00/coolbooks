"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { User } from "lucia";
import confetti from "canvas-confetti";
import { useTranslations } from "next-intl";
import {
    useMotionTemplate,
    useMotionValue,
    motion,
    animate,
} from "framer-motion";
import {
    ArrowRight,
    Bookmark,
    BookOpenText,
    ChevronLeftIcon,
    ChevronRightIcon,
    Info,
    Palette,
    Star,
    TvIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import useSave from "@/hook/use-save";
import Title from "@/components/ui/title";
import Modal from "@/components/ui/modal";
import NextImage from "@/components/ui/image";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

type HomeProps = {
    user: User | null;
};

type BooksProps = {
    title: string;
    books: {
        id: string;
        title: string;
        cover: string;
        user: {
            name: string;
        };
    }[];
    user: User | null;
};

type ThanksProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const COLORS_TOP = ["#6bc4d9", "#e89fdf"];

export const Hero: React.FC<HomeProps> = () => {
    const t = useTranslations("pages.home");
    const color = useMotionValue(COLORS_TOP[0]);
    const searchParams = useSearchParams();
    const thanks = searchParams.get("payment") === "true";
    const [open, setOpen] = useState<boolean>(thanks);

    useEffect(() => {
        animate(color, COLORS_TOP, {
            ease: "easeInOut",
            duration: 10,
            repeat: Infinity,
            repeatType: "mirror",
        });
    }, [color]);

    const border = useMotionTemplate`3px solid ${color}`;
    const boxShadow = useMotionTemplate`0px 4px 12px ${color}`;

    return (
        <>
            <div className="w-full bg-gradient-to-r from-green-100 via-primary/20 to-secondary/20 px-4 py-2 rounded-2xl">
                <div className="flex items-center justify-center text-center">
                    <span className="mr-2 text-lg">🎄</span>
                    <p className="max-sm:text-base text-gray-800">
                        {t("banner-pricing")}{" "}
                        <Link href="/pricing" className="link font-extrabold">
                            {t("banner-pricing-link")}
                        </Link>
                    </p>
                </div>
            </div>
            <div className="space-y-5 mt-6">
                <div className="flex items-center justify- max-[780px]:flex-col-reverse">
                    <div className="flex flex-col items-start md:w-1/2">
                        <span className="inline-flex items-center gap-x-1 rounded-full bg-primary/10 border border-neutral/5 px-3 py-1.5 mb-3 max-md:text-sm">
                            <Star className="inline fill-yellow-400 stroke-yellow-500 max-md:size-5" />{" "}
                            {t("info")}
                        </span>
                        <Title
                            text={t("title")}
                            className="text-2xl lg:text-5xl mx-auto w-fit m-0 font-bold"
                        />
                        <p className="my-6 max-w-xl text-left text-base leading-relaxed lg:text-xl lg:leading-relaxed">
                            {t("description")}
                        </p>
                        <motion.a
                            style={{
                                border,
                                boxShadow,
                            }}
                            href="/studio/new"
                            className="group text-lg flex w-fit items-center gap-1.5 rounded-full px-6 py-2 transition cursor-pointer bg-accent/80 text-white hover:bg-accent/90 max-md:mx-auto"
                        >
                            {t("create")}
                            <ArrowRight className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" />
                        </motion.a>
                    </div>
                    <div className="md:w-1/2 flex justify-center size-[400px] max-lg:size-[250px]">
                        <Image
                            className="size-[400px] max-lg:size-[250px]"
                            src="/images/home.png"
                            alt=""
                            width={1080}
                            height={1080}
                            priority
                        />
                    </div>
                </div>
            </div>
            <Thanks open={open} setOpen={setOpen} />
        </>
    );
};

export const Bento: React.FC = () => {
    const t = useTranslations("pages.home.features");
    const items = [
        {
            title: t("read.title"),
            description: t("read.description"),
            header: "/images/artstyles/cartoon.png",
            icon: <TvIcon className="size-5 text-neutral" />,
            className: "bg-green-100",
        },
        {
            title: t("child.title"),
            description: t("child.description"),
            header: "/images/artstyles/anime.png",
            icon: <BookOpenText className="size-5 text-neutral" />,
            className: "bg-blue-50",
        },
        {
            title: t("endless.title"),
            description: t("endless.description"),
            header: "/images/artstyles/comics.png",
            icon: <Palette className="size-5 text-neutral" />,
            className: "bg-red-50",
        },
    ];

    return (
        <BentoGrid>
            {items.map((item, i) => (
                <BentoGridItem key={i} {...item} />
            ))}
        </BentoGrid>
    );
};

export const Books: React.FC<BooksProps> = ({ title, books, user }) => {
    const t = useTranslations("pages.home");
    const tMessages = useTranslations("messages");
    const [allSavedBooks, setAllSavedBooks] = useState<string[]>(
        user?.savedBooks || []
    );
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const toggleSave = useSave();

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

    const handleSave = async (bookId: string) => {
        if (!user) {
            toast(tMessages("login-save"), {
                icon: <Info className="text-info" />,
            });
            return;
        }

        const alreadySaved = allSavedBooks.includes(bookId);

        if (alreadySaved) {
            setAllSavedBooks(allSavedBooks.filter((id) => id !== bookId));
        } else {
            setAllSavedBooks([...allSavedBooks, bookId]);
        }

        await toggleSave(alreadySaved ? "unsave" : "save", bookId);
    };

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
                                onClick={() => handleSave(book.id)}
                            >
                                <Bookmark
                                    className={cn(
                                        "size-6 text-white",
                                        allSavedBooks.includes(book.id) &&
                                            "fill-white"
                                    )}
                                />
                            </button>
                            <Link href={`/book/${book.id}`}>
                                <div className="relative aspect-square shadow-lg rounded-lg overflow-hidden">
                                    <NextImage
                                        className=""
                                        src={book.cover}
                                        width={1024}
                                        height={1024}
                                        alt={book.title}
                                        isCover
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

const Thanks: React.FC<ThanksProps> = ({ open, setOpen }) => {
    const t = useTranslations("pages.home.thanks");

    useEffect(() => {
        if (!open) return;

        const scalar = 2;
        const book = confetti.shapeFromText({ text: "📚", scalar });
        const star = confetti.shapeFromText({ text: "🤩", scalar });

        const defaults = {
            spread: 360,
            ticks: 60,
            gravity: 0,
            decay: 0.96,
            startVelocity: 20,
            shapes: [book, star],
            scalar,
        };
        const shoot = () => {
            confetti({
                ...defaults,
                particleCount: 40,
            });

            confetti({
                ...defaults,
                particleCount: 10,
                flat: true,
            });

            confetti({
                ...defaults,
                particleCount: 15,
                scalar: scalar / 2,
                shapes: ["circle"],
            });
        };

        shoot();
    }, [open]);

    return (
        <Modal isOpen={open} setIsOpen={setOpen} className="w-full">
            <div className="text-center mx-auto sm:p-8 w-full">
                <div className="text-6xl mb-4">🎉</div>
                <Title
                    text={t("title")}
                    underline
                    className="md:text-3xl text-xl w-fit mx-auto"
                />

                <p className="text-sm text-gray-600 my-6">{t("subtitle")}</p>

                <div className="space-y-4 mb-8 text-left">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">✨</span>
                        <p className="pt-1">{t("feature1")}</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">📚</span>
                        <p className="pt-1">{t("feature2")}</p>
                    </div>
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🎨</span>
                        <p className="pt-1">{t("feature3")}</p>
                    </div>
                </div>

                <div className="flex max-md:flex-col gap-3">
                    <Link
                        href="/studio/new"
                        className="btn btn-primary w-full md:w-1/2"
                    >
                        {t("cta-primary")}
                    </Link>
                    <Link
                        href="/account/profile"
                        className="btn w-full md:w-1/2"
                    >
                        {t("cta-secondary")}
                    </Link>
                </div>
            </div>
        </Modal>
    );
};
