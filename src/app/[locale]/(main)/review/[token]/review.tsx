"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Loader2, Star } from "lucide-react";
import { cn, requestAPI } from "@/lib/utils";
import Title from "@/components/ui/title";

type Props = {
    token: string;
    title: string;
    percent: number;
    existingCode: string | null;
};

const ReviewForm: React.FC<Props> = ({
    token,
    title,
    percent,
    existingCode,
}) => {
    const t = useTranslations("pages.review");
    const [rating, setRating] = useState(0);
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [code, setCode] = useState(existingCode);

    const submit = async () => {
        setSending(true);
        try {
            const res = await requestAPI<unknown>("POST", "/api/review", {
                token,
                rating,
                text,
            });
            const data = res as unknown as { success: boolean; code?: string };
            if (data.success && data.code) setCode(data.code);
        } finally {
            setSending(false);
        }
    };

    if (code) {
        return (
            <section className="mx-auto max-w-xl px-4 py-16 text-center">
                <Title text={t("thanks")} className="type-display-md" />
                <p className="type-body mt-6 text-muted">
                    {t("code", { percent })}
                </p>
                <p className="mt-3 rounded-2xl border-2 border-dashed border-ink bg-white py-4 font-mono text-2xl font-bold tracking-widest text-ink">
                    {code}
                </p>
                <Link href="/new" className="button-primary mt-8 inline-flex">
                    {t("new")}
                </Link>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-xl px-4 py-12 md:py-16">
            <Title text={t("heading", { title })} className="type-display-md" />
            <p className="type-body mt-3 text-muted">
                {t("intro", { percent })}
            </p>

            <p className="field-label mt-8">{t("rating")}</p>
            <div className="mt-1 flex gap-1" role="radiogroup">
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        type="button"
                        role="radio"
                        aria-checked={rating === n}
                        aria-label={`${n}/5`}
                        onClick={() => setRating(n)}
                        className="p-1"
                    >
                        <Star
                            className={cn(
                                "size-9",
                                n <= rating ? "fill-sun text-ink" : (
                                    "text-border-strong"
                                )
                            )}
                        />
                    </button>
                ))}
            </div>

            <label className="mt-6 block">
                <span className="field-label">{t("text")}</span>
                <textarea
                    className="field min-h-32 py-3"
                    value={text}
                    maxLength={1000}
                    onChange={(e) => setText(e.target.value)}
                />
            </label>

            <button
                type="button"
                onClick={submit}
                disabled={!rating || sending}
                className="button-primary mt-6 w-full disabled:opacity-50"
            >
                {sending && <Loader2 className="size-5 animate-spin" />}
                {t("submit")}
            </button>
        </section>
    );
};

export default ReviewForm;
