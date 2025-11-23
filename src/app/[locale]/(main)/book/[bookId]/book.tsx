"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { redirect, usePathname } from "next/navigation";
import { motion, useMotionValue } from "framer-motion";
import {
    BookImage,
    Bookmark,
    ChevronLeft,
    ChevronRight,
    FileImage,
    Info,
    Lock,
    Maximize2,
    Minimize2,
    Settings,
    Trash2,
    Unlock,
} from "lucide-react";
import toast from "react-hot-toast";
import type { User } from "lucia";
import { cn, sortPages } from "@/lib/utils";
import useSave from "@/hook/use-save";
import Title from "@/components/ui/title";
import NextImage from "@/components/ui/image";
import DeleteBook from "@/components/ui/delete-book";
import FullscreenError from "@/components/ui/fullscreen-error";
import saveAs from "file-saver";

type Page = {
    id: string;
    number: number;
    text: string;
    color: string;
    image: string;
};

export type BookProps = {
    book: {
        id: string;
        title: string;
        cover: string;
        pages: Page[];
        public: boolean;
        user: {
            name: string;
        };
    };
    user: User | null;
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

const DRAG_BUFFER = 25;

const SPRING_OPTIONS = {
    type: "spring",
    mass: 3,
    stiffness: 400,
    damping: 50,
};

const Book: React.FC<BookProps> = ({ book, user, isCreator }) => {
    const t = useTranslations("pages.book");
    const tMessages = useTranslations("messages");
    const [imgIndex, setImgIndex] = useState(0);
    const [loadingPublic, setLoadingPublic] = useState(false);
    const [bookPublic, setBookPublic] = useState<boolean>(book.public);
    const [showFullscreen, setShowFullscreen] = useState(false);
    const [fullscreenError, setFullscreenError] = useState(false);
    const [open, setOpen] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isSaved, setIsSaved] = useState<boolean>(
        user?.savedBooks.includes(book.id) ?? false
    );

    const toggleSave = useSave();

    const togglePublic: React.MouseEventHandler<HTMLLabelElement> = async (
        e
    ) => {
        e.stopPropagation();
        if (loadingPublic) {
            return;
        }
        if (!user) {
            toast(tMessages("login-save"), {
                icon: <Info className="text-info" />,
            });
            return;
        }
        if (!isCreator) {
            toast(tMessages("unauthorized"), {
                icon: <Info className="text-info" />,
            });
            return;
        }

        setLoadingPublic(true);
        setBookPublic((e) => !e);
        await fetch("/api/book/update", {
            method: "POST",
            body: JSON.stringify({
                id: book.id,
                public: !bookPublic,
            }),
        });
        setLoadingPublic(false);
    };

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
        } catch (_) {
            setFullscreenError(true);
        }
    };

    const exitFullscreen = async () => {
        try {
            if (!document.fullscreenElement) return;
            await document.exitFullscreen();
        } catch (_) {
            window.location.reload();
        }
    };

    const toggleFullscreen = () => {
        if (document.fullscreenElement) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    };

    const handleSave = async () => {
        if (!user) {
            toast(tMessages("login-save"), {
                icon: <Info className="text-info" />,
            });
            return;
        }

        setIsSaved((e) => !e);

        await toggleSave(isSaved ? "unsave" : "save", book.id);
    };

    const exportEPUB = async () => {
        try {
            const response = await fetch(
                `/api/book/export?format=epub&bookId=${book.id}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch file");
            }

            const blob = await response.blob();

            saveAs(blob, `${book.title}.epub`);
        } catch (error) {
            toast.error(tMessages("server-error"));
        }
    };

    const exportPDF = async (orientation: "portrait" | "landscape") => {
        try {
            const response = await fetch(
                `/api/book/export?format=pdf&orientation=${orientation}&bookId=${book.id}`
            );

            if (!response.ok) {
                throw new Error("Failed to fetch file");
            }

            const blob = await response.blob();

            saveAs(blob, `${book.title}.pdf`);
        } catch (error) {
            toast.error(tMessages("server-error"));
        }
    };

    return (
        <>
            <DeleteBook
                bookId={book.id}
                callback={() => redirect("/")}
                open={open}
                setOpen={setOpen}
            />
            <FullscreenError
                open={fullscreenError}
                setOpen={setFullscreenError}
            />
            <div className="w-full max-w-[850px] px-2 flex items-center justify-between mt-4 mx-auto">
                <div className="flex flex-col">
                    <Title text={book.title} className="font-bold text-xl" />
                    <p className="text-neutral">
                        {t("by")} {book.user.name}
                    </p>
                </div>

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

                    <div className="dropdown dropdown-end">
                        <div
                            tabIndex={0}
                            role="button"
                            className="btn btn-circle btn-soft bg-secondary text-white"
                        >
                            <Settings className="size-6" />
                        </div>
                        <ul
                            tabIndex={-1}
                            className="dropdown-content menu bg-base-200 !z-40 rounded-box w-64 p-2 shadow-xl border border-base-300 gap-y-2 mt-2"
                        >
                            {isCreator && (
                                <li>
                                    <label
                                        className={cn(
                                            "btn rounded-xl justify-between",
                                            loadingPublic && "contrast-50"
                                        )}
                                        onClick={togglePublic}
                                    >
                                        <span className="flex items-center gap-x-2">
                                            {bookPublic ?
                                                <Unlock className="size-6" />
                                            :   <Lock className="size-6" />}
                                            {t("public")}
                                        </span>
                                        <input
                                            type="checkbox"
                                            className="toggle toggle-primary"
                                            checked={bookPublic}
                                            readOnly
                                        />
                                    </label>
                                </li>
                            )}

                            <li>
                                <button
                                    onClick={handleSave}
                                    className="btn rounded-xl justify-start"
                                >
                                    <Bookmark
                                        className={cn(
                                            "size-6 text-primary",
                                            isSaved && "fill-primary"
                                        )}
                                    />
                                    {isSaved ? t("unsave") : t("save")}
                                </button>
                            </li>

                            <div className="divider mx-auto -my-2 w-full px-2" />

                            <>
                                <div className="dropdown md:dropdown-left">
                                    <div
                                        tabIndex={0}
                                        role="button"
                                        className="btn rounded-xl justify-start w-full"
                                    >
                                        <FileImage className="size-6" />
                                        {t("download-pdf")}
                                    </div>
                                    <ul
                                        tabIndex={-1}
                                        className="dropdown-content menu space-y-2 !mt-0 bg-base-100 rounded-box z-1 w-52 !mr-3 shadow-sm"
                                    >
                                        <li>
                                            <button
                                                onClick={() =>
                                                    exportPDF("landscape")
                                                }
                                                className="btn rounded-xl justify-start"
                                            >
                                                <div className="badge badge-primary">
                                                    16:9
                                                </div>
                                                {t("landscape")}
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                onClick={() =>
                                                    exportPDF("portrait")
                                                }
                                                className="btn rounded-xl justify-start"
                                            >
                                                <div className="badge badge-primary">
                                                    9:16
                                                </div>
                                                {t("portrait")}
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </>

                            <li>
                                <button
                                    onClick={() => exportEPUB()}
                                    className="btn rounded-xl justify-start"
                                >
                                    <BookImage className="size-6" />
                                    {t("download-epub")}
                                </button>
                            </li>

                            {isCreator && (
                                <>
                                    <div className="divider mx-auto -my-2 w-full px-2" />

                                    <button
                                        className="btn rounded-xl justify-start btn-soft btn-error w-full"
                                        onClick={() => setOpen(true)}
                                    >
                                        <Trash2 className="size-6" />
                                        {t("delete")}
                                    </button>
                                </>
                            )}
                        </ul>
                    </div>
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
                            <div className="min-w-full h-screen flex items-center justify-center">
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
                                                <div className="text-xl md:text-2xl leading-relaxed text-justify">
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
                                        <div className="text-xl md:text-2xl leading-relaxed text-justify p-8">
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

const _MustLogin: React.FC = () => {
    const t = useTranslations("pages.book.must-login");
    const pathname = usePathname();

    return (
        <div className="flex flex-col items-center justify-center mx-auto w-full max-w-lg">
            <Image
                src="/images/book-smiley.svg"
                width={400}
                height={400}
                alt=""
                className="mx-auto h-40"
            />

            <Title
                text={t("title")}
                className="text-2xl mb-6 text-center"
                underline
            />

            <p className="text-center max-w-sm">{t("description")}</p>

            <div className="w-full flex justify-center gap-2 mt-4">
                <Link
                    href={`/login?redirect=${pathname}`}
                    className="btn btn-primary"
                >
                    <span>{t("login")}</span>
                </Link>
                <Link
                    href={`/register?redirect=${pathname}`}
                    className="btn btn-secondary"
                >
                    <span>{t("register")}</span>
                </Link>
            </div>
        </div>
    );
};

export default Book;
