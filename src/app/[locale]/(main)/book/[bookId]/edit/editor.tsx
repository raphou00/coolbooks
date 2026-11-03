"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Printer, Save } from "lucide-react";
import toast from "react-hot-toast";
import { cn, getImage, requestAPI } from "@/lib/utils";
import Title from "@/components/ui/title";
import { maxPageTextLength, maxTitleLength } from "@/config/char";
import { maxDedicationLength } from "@/schema/book";

type EditPage = {
    id: string;
    number: number;
    text: string;
    color: string;
    image: string;
    previousImages: string[];
};

type Props = {
    editKey: string | null;
    locked: boolean;
    hasPrint: boolean;
    book: { id: string; title: string; dedication: string; pages: EditPage[] };
};

/** Soft page colours, same family as the generator's. */
const COLORS = [
    "#FFF5F5",
    "#FFF0F5",
    "#F0F8FF",
    "#F5FFFA",
    "#FFFACD",
    "#FFF8DC",
    "#F0FFF0",
    "#F8F8FF",
    "#FDF5E6",
    "#E6E6FA",
    "#FFEFD5",
    "#E0FFFF",
];

const Editor: React.FC<Props> = ({ editKey, locked, hasPrint, book }) => {
    const t = useTranslations("pages.edit");
    const router = useRouter();
    const [title, setTitle] = useState(book.title);
    const [dedication, setDedication] = useState(book.dedication);
    const [pages, setPages] = useState(book.pages);
    const [saving, setSaving] = useState(false);
    const keyQuery = editKey ? `?key=${editKey}` : "";

    const setPage = (id: string, patch: Partial<EditPage>) =>
        setPages((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));

    const save = async () => {
        setSaving(true);
        try {
            const res = await requestAPI<unknown>("POST", "/api/book/edit", {
                bookId: book.id,
                key: editKey,
                title,
                dedication,
                pages: pages.map(({ id, text, color, image }) => ({
                    id,
                    text,
                    color,
                    image,
                })),
            });
            if (res.success) {
                toast.success(res.message ?? t("saved"));
                router.refresh();
            }
        } finally {
            setSaving(false);
        }
    };

    const counter = (count: number, max: number) => (
        <span
            className={cn(
                "type-caption tabular-nums",
                count > max ? "text-error" : "text-muted"
            )}
        >
            {t("chars", { count, max })}
        </span>
    );

    return (
        <section className="mx-auto w-full max-w-4xl px-4 py-10 md:py-14">
            <Link
                href={`/book/${book.id}${keyQuery}`}
                className="type-caption text-muted underline"
            >
                ← {t("back")}
            </Link>
            <Title text={t("heading")} className="type-display-md mt-3" />
            <p className="type-body mt-3 max-w-2xl text-muted">
                {locked ? t("locked") : t("intro")}
            </p>

            <fieldset disabled={locked || saving} className="mt-8 space-y-8">
                <div className="grid gap-4 md:grid-cols-2">
                    <label className="block">
                        <span className="flex justify-between">
                            <span className="field-label">
                                {t("book-title")}
                            </span>
                            {counter(title.length, maxTitleLength)}
                        </span>
                        <input
                            className="field"
                            value={title}
                            maxLength={maxTitleLength}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </label>
                    <label className="block">
                        <span className="flex justify-between">
                            <span className="field-label">
                                {t("dedication")}
                            </span>
                            {counter(dedication.length, maxDedicationLength)}
                        </span>
                        <input
                            className="field"
                            value={dedication}
                            maxLength={maxDedicationLength}
                            onChange={(e) => setDedication(e.target.value)}
                        />
                    </label>
                </div>

                {pages.map((page, i) => (
                    <div
                        key={page.id}
                        className="grid gap-4 rounded-3xl border-2 border-ink bg-white p-4 md:grid-cols-[220px_1fr] md:p-5"
                    >
                        <div>
                            <p className="type-label text-ink">
                                {t("page", { n: i + 1 })}
                            </p>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={getImage(page.image)}
                                alt=""
                                className="mt-2 aspect-square w-full rounded-2xl object-cover"
                            />
                            {page.previousImages.length > 0 && (
                                <div className="mt-2">
                                    <p className="type-caption text-muted">
                                        {t("earlier")}
                                    </p>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {[
                                            ...book.pages[i].previousImages,
                                            book.pages[i].image,
                                        ]
                                            .filter((img) => img !== page.image)
                                            .map((img) => (
                                                <button
                                                    key={img}
                                                    type="button"
                                                    onClick={() =>
                                                        setPage(page.id, {
                                                            image: img,
                                                        })
                                                    }
                                                    className="size-12 overflow-hidden rounded-lg border border-ink/30"
                                                >
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={getImage(img)}
                                                        alt=""
                                                        className="size-full object-cover"
                                                    />
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3">
                            <label className="block flex-1">
                                <span className="flex justify-between">
                                    <span className="field-label">
                                        {t("text")}
                                    </span>
                                    {counter(
                                        page.text.length,
                                        maxPageTextLength
                                    )}
                                </span>
                                <textarea
                                    className="field min-h-36 py-3"
                                    style={{ backgroundColor: page.color }}
                                    value={page.text}
                                    maxLength={maxPageTextLength}
                                    onChange={(e) =>
                                        setPage(page.id, {
                                            text: e.target.value,
                                        })
                                    }
                                />
                            </label>
                            <div>
                                <span className="field-label">
                                    {t("color")}
                                </span>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {COLORS.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            aria-label={c}
                                            onClick={() =>
                                                setPage(page.id, { color: c })
                                            }
                                            className={cn(
                                                "size-7 rounded-full border",
                                                page.color.toUpperCase() === c ?
                                                    "border-2 border-ink"
                                                :   "border-ink/20"
                                            )}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </fieldset>

            {!locked && (
                <div className="sticky bottom-4 mt-8 flex flex-wrap justify-end gap-3">
                    {hasPrint && (
                        <Link
                            href={`/book/${book.id}/print${keyQuery}`}
                            className="button-secondary"
                        >
                            <Printer className="size-5" />
                            {t("print-preview")}
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={save}
                        disabled={saving || !title.trim()}
                        className="button-primary"
                    >
                        {saving ?
                            <Loader2 className="size-5 animate-spin" />
                        :   <Save className="size-5" />}
                        {t("save")}
                    </button>
                </div>
            )}
        </section>
    );
};

export default Editor;
