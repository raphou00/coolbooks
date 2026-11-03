"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { AlertTriangle, ExternalLink, Loader2, Printer } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { requestAPI } from "@/lib/utils";
import Title from "@/components/ui/title";
import type { PrintStatus } from "@/lib/db/types";
import type { ShippingAddress } from "@/lib/gelato";
import type { PrintWarning } from "@/lib/print";

type Props = {
    bookId: string;
    title: string;
    editKey: string | null;
    status: PrintStatus;
    trackingUrl: string | null;
    address: ShippingAddress | null;
};

const PrintPreview: React.FC<Props> = ({
    bookId,
    title,
    editKey,
    status,
    trackingUrl,
    address,
}) => {
    const t = useTranslations("pages.print");
    const router = useRouter();
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [warnings, setWarnings] = useState<PrintWarning[]>([]);
    const [approved, setApproved] = useState(false);
    const [sending, setSending] = useState(false);
    const [form, setForm] = useState({
        name: address?.name ?? "",
        line1: address?.line1 ?? "",
        line2: address?.line2 ?? "",
        postalCode: address?.postalCode ?? "",
        city: address?.city ?? "",
    });

    const query = `bookId=${bookId}${editKey ? `&key=${editKey}` : ""}`;
    const bookHref = `/book/${bookId}${editKey ? `?key=${editKey}` : ""}`;
    const open = status === "AWAITING_CONFIRMATION";

    useEffect(() => {
        let url: string | null = null;
        (async () => {
            const res = await fetch(`/api/book/print/file?${query}`);
            if (!res.ok) return;
            setWarnings(
                JSON.parse(res.headers.get("x-print-warnings") ?? "[]")
            );
            url = URL.createObjectURL(await res.blob());
            setPdfUrl(url);
        })();
        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [query]);

    const confirm = async () => {
        setSending(true);
        try {
            const res = await requestAPI<unknown>(
                "POST",
                "/api/book/print/confirm",
                { bookId, key: editKey, approved, address: form }
            );
            if (res.success) {
                toast.success(res.message ?? t("sent"));
                router.refresh();
            }
        } finally {
            setSending(false);
        }
    };

    const warningText = (w: PrintWarning) =>
        w.kind === "title-missing" ? t("title-missing")
        : w.kind === "text-too-long" ? t("text-too-long", { page: w.page })
        : t("image-low-res", { page: w.page });

    const field = (
        name: keyof typeof form,
        autoComplete: string,
        extra: React.InputHTMLAttributes<HTMLInputElement> = {}
    ) => (
        <label className="block">
            <span className="field-label">{t(name)}</span>
            <input
                className="field"
                name={name}
                autoComplete={autoComplete}
                value={form[name]}
                onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                disabled={!open}
                {...extra}
            />
        </label>
    );

    return (
        <section className="mx-auto w-full max-w-5xl px-4 py-10 md:py-14">
            <Link href={bookHref} className="type-caption text-muted underline">
                ← {t("back")}
            </Link>
            <Title
                text={open ? t("heading") : t("status-title")}
                className="type-display-md mt-3"
            />
            <p className="type-body mt-3 max-w-2xl text-muted">
                {open ? t("intro") : title}
            </p>

            {!open && (
                <div className="mt-6 rounded-3xl border-2 border-ink bg-white p-5">
                    <p className="type-title-md text-ink">
                        {t(`status.${status}`)}
                    </p>
                    {trackingUrl && (
                        <a
                            href={trackingUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="button-secondary button-sm mt-4 inline-flex gap-2"
                        >
                            {t("track")} <ExternalLink className="size-4" />
                        </a>
                    )}
                </div>
            )}

            <div
                className={`mt-8 grid gap-8 ${open ? "lg:grid-cols-[1fr_340px]" : ""}`}
            >
                <div className="overflow-hidden rounded-3xl border-2 border-ink bg-white">
                    {pdfUrl ?
                        <iframe
                            src={pdfUrl}
                            title={t("title", { title })}
                            className="h-[70vh] w-full"
                        />
                    :   <div className="flex h-[70vh] flex-col items-center justify-center gap-3 text-muted">
                            <Loader2 className="size-8 animate-spin" />
                            <p className="type-body">{t("loading")}</p>
                        </div>
                    }
                    {pdfUrl && (
                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="type-caption block border-t border-border-strong/30 px-4 py-2 text-center text-muted underline"
                        >
                            {t("download")}
                        </a>
                    )}
                </div>

                {open && (
                    <aside className="space-y-6">
                        {warnings.length > 0 && (
                            <div className="rounded-3xl bg-sun/40 p-5">
                                <p className="type-label flex items-center gap-2 text-ink">
                                    <AlertTriangle className="size-4" />
                                    {t("warnings")}
                                </p>
                                <ul className="type-body mt-2 list-disc space-y-1 pl-5">
                                    {warnings.map((w, i) => (
                                        <li key={i}>{warningText(w)}</li>
                                    ))}
                                </ul>
                                <Link
                                    href={`/book/${bookId}/edit${editKey ? `?key=${editKey}` : ""}`}
                                    className="button-secondary button-sm mt-4 inline-flex"
                                >
                                    {t("edit")}
                                </Link>
                            </div>
                        )}

                        <div className="space-y-3">
                            <p className="type-label text-ink">
                                {t("address")}
                            </p>
                            {field("name", "name")}
                            {field("line1", "address-line1")}
                            {field("line2", "address-line2")}
                            <div className="grid grid-cols-[110px_1fr] gap-3">
                                {field("postalCode", "postal-code", {
                                    inputMode: "numeric",
                                    maxLength: 4,
                                })}
                                {field("city", "address-level2")}
                            </div>
                        </div>

                        <label className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={approved}
                                onChange={(e) => setApproved(e.target.checked)}
                                className="mt-1 size-5 accent-primary"
                            />
                            <span className="type-body text-ink">
                                {t("approve")}
                            </span>
                        </label>

                        <button
                            type="button"
                            onClick={confirm}
                            disabled={!approved || sending || !pdfUrl}
                            className="button-primary w-full gap-2 disabled:opacity-50"
                        >
                            {sending ?
                                <Loader2 className="size-5 animate-spin" />
                            :   <Printer className="size-5" />}
                            {t("confirm")}
                        </button>
                    </aside>
                )}
            </div>
        </section>
    );
};

export default PrintPreview;
