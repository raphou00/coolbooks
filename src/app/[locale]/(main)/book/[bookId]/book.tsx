"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { motion, useMotionValue } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Download,
    Loader2,
    RefreshCw,
    Square,
    Trash2,
    Volume2,
} from "lucide-react";
import toast from "react-hot-toast";
import saveAs from "file-saver";
import { cn, requestAPI } from "@/lib/utils";
import Title from "@/components/ui/title";
import NextImage from "@/components/ui/image";
import DeleteBook from "@/components/ui/delete-book";
import { BooFace } from "@/components/ui/boo";

type Page = {
    id: string;
    number: number;
    text: string;
    color: string;
    image: string;
};

type Slide = Page & { kind: "cover" | "dedication" | "page" };

type BookProps = {
    book: {
        id: string;
        title: string;
        cover: string;
        dedication: string | null;
        redraws: number;
        pages: Page[];
    };
    /** Owner or holder of the private link: may redraw and delete. */
    canEdit: boolean;
    editKey: string | null;
    maxRedraws: number;
};

const DRAG_BUFFER = 25;

const SPRING_OPTIONS = {
    type: "spring",
    mass: 3,
    stiffness: 400,
    damping: 50,
} as const;

const Book: React.FC<BookProps> = ({ book, canEdit, editKey, maxRedraws }) => {
    const t = useTranslations("pages.book");
    const tMessages = useTranslations("messages");
    const router = useRouter();
    const [imgIndex, setImgIndex] = useState(0);
    const [loadingPdf, setLoadingPdf] = useState(false);
    const [open, setOpen] = useState<boolean>(false);
    const [pages, setPages] = useState<Page[]>(book.pages);
    const [redrawsLeft, setRedrawsLeft] = useState(
        Math.max(0, maxRedraws - book.redraws)
    );
    const [redrawing, setRedrawing] = useState<string | null>(null);
    const [reading, setReading] = useState(false);
    const [loadingAudio, setLoadingAudio] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const readingRef = useRef(false);

    const slides: Slide[] = useMemo(
        () => [
            {
                id: "cover",
                image: book.cover,
                text: "",
                color: "",
                number: -2,
                kind: "cover",
            },
            ...(book.dedication ?
                [
                    {
                        id: "dedication",
                        image: "",
                        text: book.dedication,
                        color: "",
                        number: -1,
                        kind: "dedication" as const,
                    },
                ]
            :   []),
            ...[...pages]
                .sort((a, b) => a.number - b.number)
                .map((p) => ({ ...p, kind: "page" as const })),
        ],
        [book.cover, book.dedication, pages]
    );

    const dragX = useMotionValue(0);

    const onDragEnd = () => {
        const x = dragX.get();
        if (x <= -DRAG_BUFFER && imgIndex < slides.length - 1) {
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
        } catch (err) {
            console.error(err);
            toast.error(tMessages("server-error"));
        } finally {
            setLoadingPdf(false);
        }
    };

    /* ---------- Boo reads ---------- */

    const stopReading = useCallback(() => {
        readingRef.current = false;
        setReading(false);
        setLoadingAudio(false);
        audioRef.current?.pause();
    }, []);

    const readFrom = useCallback(
        (start: number) => {
            // Reads one page, then chains to the next when its audio ends.
            const readPage = async (index: number) => {
                // Skip the cover: start at the first slide that has text.
                let i = index;
                while (i < slides.length && slides[i].kind !== "page") i++;
                if (i >= slides.length || !readingRef.current) {
                    stopReading();
                    return;
                }

                setImgIndex(i);
                setLoadingAudio(true);
                try {
                    const res = await fetch(
                        `/api/book/audio?bookId=${book.id}&pageId=${slides[i].id}`
                    );
                    const data = (await res.json()) as { url?: string };
                    if (!res.ok || !data.url) throw new Error("audio");
                    if (!readingRef.current) return;

                    if (!audioRef.current) audioRef.current = new Audio();
                    audioRef.current.src = data.url;
                    audioRef.current.onended = () => void readPage(i + 1);
                    setLoadingAudio(false);
                    await audioRef.current.play();
                } catch {
                    toast.error(tMessages("server-error"));
                    stopReading();
                }
            };
            return readPage(start);
        },
        [book.id, slides, stopReading, tMessages]
    );

    const toggleReading = () => {
        if (readingRef.current) {
            stopReading();
            return;
        }
        readingRef.current = true;
        setReading(true);
        void readFrom(imgIndex);
    };

    useEffect(() => () => audioRef.current?.pause(), []);

    /* ---------- Free redraw ---------- */

    const redraw = async (pageId: string) => {
        if (redrawing) return;
        setRedrawing(pageId);
        const res = await requestAPI<{ pageId: string }>(
            "POST",
            "/api/book/redraw",
            { bookId: book.id, pageId, key: editKey }
        );
        if (res.success && res.key) {
            setPages((all) =>
                all.map((p) => (p.id === pageId ? { ...p, image: res.key } : p))
            );
            setRedrawsLeft((n) => Math.max(0, n - 1));
        }
        setRedrawing(null);
    };

    const handlePrev = () => setImgIndex((pv) => Math.max(0, pv - 1));
    const handleNext = () =>
        setImgIndex((pv) => Math.min(slides.length - 1, pv + 1));

    return (
        <>
            {canEdit && (
                <DeleteBook
                    bookId={book.id}
                    callback={() => router.push("/my-books")}
                    open={open}
                    setOpen={setOpen}
                />
            )}
            <div className="mx-auto flex w-full max-w-[948px] flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                    <p className="type-caption text-muted tabular-nums">
                        {imgIndex + 1} / {slides.length}
                    </p>
                    <Title text={book.title} className="type-display-md mt-2" />
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                        onClick={toggleReading}
                        className="button-secondary button-sm"
                        aria-pressed={reading}
                    >
                        {loadingAudio ?
                            <Loader2 className="size-4 animate-spin" />
                        : reading ?
                            <Square className="size-4" />
                        :   <span className="w-5">
                                <BooFace />
                            </span>
                        }
                        {reading ? t("stop") : t("read-aloud")}
                        {!reading && <Volume2 className="size-4" />}
                    </button>
                    <button
                        onClick={exportPDF}
                        className="button-primary button-sm"
                        disabled={loadingPdf}
                    >
                        {loadingPdf ?
                            <Loader2 className="size-4 animate-spin" />
                        :   <Download className="size-4" />}
                        {t("download-pdf")}
                    </button>
                    {canEdit && (
                        <button
                            onClick={() => setOpen(true)}
                            className="button-icon text-error!"
                            title={t("delete")}
                            aria-label={t("delete")}
                        >
                            <Trash2 className="size-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="relative mt-8 overflow-hidden md:mt-10">
                <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    style={{ x: dragX }}
                    animate={{ translateX: `-${imgIndex * 100}%` }}
                    transition={SPRING_OPTIONS}
                    onDragEnd={onDragEnd}
                    className="flex cursor-grab items-start active:cursor-grabbing"
                >
                    {slides.map((slide, idx) => (
                        <div key={slide.id} className="w-full shrink-0">
                            {slide.kind === "dedication" ?
                                <div className="mx-auto flex aspect-square w-full max-w-[450px] flex-col items-center justify-center gap-4 rounded-md border-2 border-dashed border-hairline bg-paper p-10 text-center">
                                    <p className="type-eyebrow text-muted">
                                        {t("dedication")}
                                    </p>
                                    <p className="font-display text-2xl font-medium text-ink">
                                        {slide.text}
                                    </p>
                                </div>
                            :   <div className="flex min-w-full flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
                                    <div
                                        className={cn(
                                            "relative aspect-square w-full max-w-[450px]",
                                            idx === 0 ? "max-md:w-full" : (
                                                "max-md:w-[70vw]"
                                            )
                                        )}
                                    >
                                        {slide.image !== "" && (
                                            <NextImage
                                                key={slide.image}
                                                src={slide.image}
                                                className="rounded-md select-none"
                                                alt={slide.text}
                                                width={1024}
                                                height={1024}
                                                isCover={slide.kind === "cover"}
                                            />
                                        )}
                                        {redrawing === slide.id && (
                                            <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-2 rounded-md bg-canvas/85 text-center">
                                                <Loader2 className="size-6 animate-spin text-ink" />
                                                <span className="type-label text-ink">
                                                    {t("redrawing")}
                                                </span>
                                            </div>
                                        )}
                                        {canEdit &&
                                            slide.kind === "page" &&
                                            redrawsLeft > 0 &&
                                            redrawing !== slide.id && (
                                                <button
                                                    onClick={() =>
                                                        redraw(slide.id)
                                                    }
                                                    disabled={!!redrawing}
                                                    className="button-secondary button-sm absolute right-3 bottom-3 z-40"
                                                    title={t("redraws-left", {
                                                        count: redrawsLeft,
                                                    })}
                                                >
                                                    <RefreshCw className="size-4" />
                                                    {t("redraw")}
                                                </button>
                                            )}
                                    </div>
                                    {slide.text && (
                                        <div
                                            className="relative flex w-full max-w-[450px] flex-col justify-center rounded-md text-navy max-md:mx-auto md:aspect-square"
                                            style={{ background: slide.color }}
                                        >
                                            <div className="type-title-md p-8 md:p-12 md:text-[22px]">
                                                {slide.text}
                                            </div>
                                            <p className="type-caption absolute bottom-4 left-1/2 -translate-x-1/2 text-navy/60 tabular-nums">
                                                {slide.number + 1}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            }
                        </div>
                    ))}
                </motion.div>
            </div>

            {canEdit && (
                <p className="type-caption mt-6 text-center text-muted">
                    ✨ {t("redraws-left", { count: redrawsLeft })}
                </p>
            )}

            <div className="mx-auto mt-6 flex w-fit items-center gap-4">
                <button
                    className="button-icon"
                    onClick={handlePrev}
                    disabled={imgIndex === 0}
                    aria-label="Previous page"
                >
                    <ChevronLeft className="size-4" />
                </button>
                <div className="flex flex-wrap justify-center gap-1.5">
                    {slides.map((s, idx) => (
                        <button
                            key={s.id}
                            onClick={() => setImgIndex(idx)}
                            className={cn(
                                "h-2 rounded-full transition-all",
                                idx === imgIndex ? "w-6 bg-ink" : (
                                    "w-2 bg-hairline"
                                )
                            )}
                            aria-label={`Go to page ${idx + 1}`}
                        />
                    ))}
                </div>
                <button
                    className="button-icon"
                    onClick={handleNext}
                    disabled={imgIndex === slides.length - 1}
                    aria-label="Next page"
                >
                    <ChevronRight className="size-4" />
                </button>
            </div>
        </>
    );
};

export default Book;
