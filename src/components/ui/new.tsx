"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Gift, Info, Loader2, Lock, RefreshCw, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type ActionsState } from "@/lib/types";
import { cn, formatAmountForDisplay, requestAPI } from "@/lib/utils";
import {
    christmasPrintDeadline,
    compareAtPrice,
    maxRedraws,
    price,
    printEnabled,
    printPrice,
} from "@/config/stripe";
import FormReponse from "@/components/ui/form-response";
import FormInput from "@/components/ui/form-input";
import FormSelect from "@/components/ui/form-select";
import NextImage from "@/components/ui/image";
import Boo from "@/components/ui/boo";
import {
    ageOptions,
    artStyleOptions,
    checkoutSchema,
    eyeColorOptions,
    genderOptions,
    hairColorOptions,
    maxDedicationLength,
    previewSchema,
    skinToneOptions,
    type CheckoutSchema,
    type PreviewSchema,
} from "@/schema/book";

const genderImages: Record<string, string> = {
    boy: "👦",
    girl: "👧",
};

export const artStyleImages: Record<string, string> = {
    cartoon: "🎨",
    comics: "🧚🏻",
    anime: "💥",
    watercolor: "🎭",
};

type Preview = { id: string; title: string; cover: string };
type Phase = "details" | "drawing" | "ready";

/**
 * Two-step book form: describe the child → see the free cover → choose
 * delivery and pay. The paid book is built from the approved cover.
 */
const NewBook: React.FC = () => {
    const t = useTranslations("pages.new-book");
    const tAll = useTranslations();
    const [phase, setPhase] = useState<Phase>("details");
    const [preview, setPreview] = useState<Preview | null>(null);
    const [message, setMessage] = useState<string | undefined>();
    const topRef = useRef<HTMLDivElement>(null);

    const details = useForm<PreviewSchema>({
        resolver: zodResolver(previewSchema(tAll)),
        defaultValues: { artStyle: artStyleOptions[0] },
    });

    const checkout = useForm<CheckoutSchema>({
        resolver: zodResolver(checkoutSchema(tAll)),
        defaultValues: {
            previewId: "",
            email: "",
            product: "PDF",
            dedication: "",
            isGift: false,
            giftTo: "",
            giftFrom: "",
        },
    });

    // eslint-disable-next-line react-hooks/incompatible-library
    const product = checkout.watch("product");
    const isGift = checkout.watch("isGift");
    const dedication = checkout.watch("dedication") ?? "";
    const total = product === "PRINT" ? printPrice : price;

    useEffect(() => {
        if (phase !== "details") {
            topRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }, [phase]);

    const drawCover = async (data: PreviewSchema) => {
        setMessage(undefined);
        setPhase("drawing");
        const res = (await requestAPI<PreviewSchema>(
            "POST",
            "/api/book/preview",
            data
        )) as ActionsState<PreviewSchema> & { preview?: Preview };

        if (res.success && res.preview) {
            setPreview(res.preview);
            checkout.setValue("previewId", res.preview.id);
            setPhase("ready");
        } else {
            setMessage(res.message);
            setPhase(preview ? "ready" : "details");
        }
    };

    const pay = async (data: CheckoutSchema) => {
        setMessage(undefined);
        const res = await requestAPI<CheckoutSchema>(
            "POST",
            "/api/stripe/create-checkout",
            data
        );
        if (!res.success && !res.redirect) setMessage(res.message);
    };

    const errors = details.formState.errors;
    const cErrors = checkout.formState.errors;

    return (
        <div
            ref={topRef}
            className="sticker flex w-full scroll-mt-24 flex-col gap-8 rounded-lg! p-4 sm:p-6 md:p-8"
        >
            <FormReponse success={false} message={message} />

            {/* ---------- Steps 1–3: details ---------- */}
            {phase === "details" && (
                <form
                    onSubmit={details.handleSubmit(drawCover)}
                    noValidate
                    className="flex flex-col gap-8"
                >
                    <fieldset className="flex flex-col gap-4">
                        <StepHeading n={1} title={t("child-details")} />

                        <FormInput
                            type="text"
                            label={t("child-name")}
                            placeholder={t("child-name-placeholder")}
                            error={errors.childName?.message}
                            {...details.register("childName")}
                        />

                        <div>
                            <FieldLabel
                                label={t("gender")}
                                error={errors.gender?.message}
                            />
                            <div className="grid grid-cols-2 gap-3">
                                {genderOptions.map((g) => (
                                    <label
                                        key={g}
                                        className="choice h-12 items-center justify-center gap-2 px-4"
                                    >
                                        <input
                                            type="radio"
                                            value={g}
                                            className="sr-only"
                                            {...details.register("gender")}
                                        />
                                        <span aria-hidden>
                                            {genderImages[g]}
                                        </span>
                                        <span className="type-label capitalize">
                                            {t(g)}
                                        </span>
                                        <ChoiceMark />
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormSelect
                                name="age"
                                label={t("age")}
                                defaultValue={ageOptions[0]}
                                values={ageOptions as unknown as string[]}
                                control={details.control}
                                error={errors.age?.message}
                            />
                            <FormSelect
                                name="hairColor"
                                label={t("hair-color")}
                                defaultValue={hairColorOptions[0]}
                                values={hairColorOptions as unknown as string[]}
                                control={details.control}
                                error={errors.hairColor?.message}
                                t={t}
                            />
                            <FormSelect
                                name="eyeColor"
                                label={t("eye-color")}
                                defaultValue={eyeColorOptions[0]}
                                values={eyeColorOptions as unknown as string[]}
                                control={details.control}
                                error={errors.eyeColor?.message}
                                t={t}
                            />
                            <FormSelect
                                name="skinTone"
                                label={t("skin-tone")}
                                defaultValue={skinToneOptions[0]}
                                values={skinToneOptions as unknown as string[]}
                                control={details.control}
                                error={errors.skinTone?.message}
                                t={t}
                            />
                        </div>
                    </fieldset>

                    <fieldset className="flex flex-col gap-4 border-t-2 border-dashed border-hairline pt-8">
                        <StepHeading
                            n={2}
                            title={t("art-style")}
                            error={errors.artStyle?.message}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            {artStyleOptions.map((style) => (
                                <label
                                    key={style}
                                    className="choice flex-col items-start gap-1 p-4"
                                >
                                    <input
                                        type="radio"
                                        value={style}
                                        className="sr-only"
                                        {...details.register("artStyle")}
                                    />
                                    <span
                                        className="text-xl leading-none"
                                        aria-hidden
                                    >
                                        {artStyleImages[style]}
                                    </span>
                                    <span className="type-label mt-2 capitalize">
                                        {t(style)}
                                    </span>
                                    <span className="type-body text-muted">
                                        {t(`${style}-description`)}
                                    </span>
                                    <ChoiceMark />
                                </label>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset className="flex flex-col gap-4 border-t-2 border-dashed border-hairline pt-8">
                        <StepHeading n={3} title={t("story-idea")} />
                        <label className="block">
                            <FieldLabel
                                label={t("prompt")}
                                error={errors.prompt?.message}
                            />
                            <textarea
                                placeholder={t("prompt-placeholder")}
                                className="field"
                                aria-invalid={!!errors.prompt}
                                rows={4}
                                {...details.register("prompt")}
                            />
                        </label>
                    </fieldset>

                    <div className="flex flex-col items-center gap-3 rounded-md bg-butter p-5 text-center text-navy">
                        <button type="submit" className="button-primary w-full">
                            {t("preview-cta")}
                        </button>
                        <p className="type-body font-bold">
                            {t("preview-hint")}
                        </p>
                    </div>
                </form>
            )}

            {/* ---------- Drawing ---------- */}
            {phase === "drawing" && (
                <div
                    className="flex flex-col items-center gap-4 py-10 text-center"
                    role="status"
                    aria-live="polite"
                >
                    <div className="w-44">
                        <Boo pose="read" className="animate-bob" />
                    </div>
                    <h3 className="type-title-lg text-ink">
                        {t("preview-loading-title")}
                    </h3>
                    <p className="type-body max-w-sm text-muted">
                        {t("preview-loading-body")}
                    </p>
                    <span className="flex gap-1.5" aria-hidden>
                        {[0, 1, 2].map((i) => (
                            <span
                                key={i}
                                className="size-2.5 animate-bounce rounded-full bg-tomato"
                                style={{ animationDelay: `${i * 150}ms` }}
                            />
                        ))}
                    </span>
                </div>
            )}

            {/* ---------- Step 4: approve the cover, choose delivery ---------- */}
            {phase === "ready" && preview && (
                <form
                    onSubmit={checkout.handleSubmit(pay)}
                    noValidate
                    className="flex flex-col gap-8"
                >
                    <div className="flex flex-col items-center gap-5 text-center">
                        <div className="w-full max-w-[300px] -rotate-2 rounded-md border-[2.5px] border-navy bg-white p-2 shadow-[0_6px_0_#23264a]">
                            <div className="aspect-square overflow-hidden rounded-[10px]">
                                <NextImage
                                    src={preview.cover}
                                    width={1024}
                                    height={1024}
                                    alt={preview.title}
                                    isCover
                                />
                            </div>
                        </div>
                        <div>
                            <h3 className="type-title-lg text-ink">
                                {t("preview-ready")}
                            </h3>
                            <p className="type-body mt-1 text-muted">
                                {t("preview-ready-body")}
                            </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            <button
                                type="button"
                                className="button-secondary button-sm"
                                onClick={details.handleSubmit(drawCover)}
                            >
                                <RefreshCw className="size-4" />
                                {t("preview-again")}
                            </button>
                            <button
                                type="button"
                                className="button-secondary button-sm"
                                onClick={() => setPhase("details")}
                            >
                                <Pencil className="size-4" />
                                {t("preview-edit")}
                            </button>
                        </div>
                    </div>

                    <fieldset className="flex flex-col gap-4 border-t-2 border-dashed border-hairline pt-8">
                        <StepHeading n={4} title={t("step-delivery")} />

                        {printEnabled && (
                            <div>
                                <FieldLabel label={t("format")} />
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {(["PDF", "PRINT"] as const).map((p) => (
                                        <label
                                            key={p}
                                            className="choice flex-col items-start gap-1 p-4"
                                        >
                                            <input
                                                type="radio"
                                                value={p}
                                                className="sr-only"
                                                {...checkout.register(
                                                    "product"
                                                )}
                                            />
                                            <span className="type-label">
                                                {p === "PDF" ?
                                                    t("pdf")
                                                :   t("print")}
                                            </span>
                                            <span className="type-body text-muted">
                                                {p === "PDF" ?
                                                    t("pdf-description")
                                                :   t("print-description")}
                                            </span>
                                            <span className="mt-1 font-display text-lg font-semibold tabular-nums">
                                                {formatAmountForDisplay(
                                                    p === "PDF" ? price : (
                                                        printPrice
                                                    )
                                                )}
                                            </span>
                                            <ChoiceMark />
                                        </label>
                                    ))}
                                </div>
                                <p className="type-caption mt-2 text-muted">
                                    🎄{" "}
                                    {t("christmas", {
                                        date: new Date(
                                            christmasPrintDeadline
                                        ).toLocaleDateString("de-CH"),
                                    })}
                                </p>
                            </div>
                        )}

                        <FormInput
                            type="email"
                            label={t("email")}
                            placeholder={t("email-placeholder")}
                            error={cErrors.email?.message}
                            {...checkout.register("email")}
                        />

                        <label className="block">
                            <span className="flex items-baseline justify-between gap-2">
                                <span className="field-label">
                                    {t("dedication")}
                                </span>
                                <span className="type-caption pb-1.5 text-muted tabular-nums">
                                    {dedication.length}/{maxDedicationLength}
                                </span>
                            </span>
                            <textarea
                                placeholder={t("dedication-placeholder")}
                                className="field"
                                rows={2}
                                maxLength={maxDedicationLength}
                                {...checkout.register("dedication")}
                            />
                            <span className="type-body mt-1.5 block text-muted">
                                {t("dedication-info")}
                            </span>
                        </label>

                        <label className="choice items-center gap-3 px-4 py-3">
                            <input
                                type="checkbox"
                                className="sr-only"
                                {...checkout.register("isGift")}
                            />
                            <Gift className="size-5 shrink-0" />
                            <span className="type-label flex-1">
                                {t("gift")}
                            </span>
                            <ChoiceMark square />
                        </label>

                        {isGift ?
                            <div className="grid gap-4 rounded-md bg-canvas p-4 sm:grid-cols-2">
                                <FormInput
                                    type="email"
                                    label={t("gift-to")}
                                    placeholder={t("gift-to-placeholder")}
                                    error={cErrors.giftTo?.message}
                                    {...checkout.register("giftTo")}
                                />
                                <FormInput
                                    type="text"
                                    label={t("gift-from")}
                                    placeholder={t("gift-from-placeholder")}
                                    error={cErrors.giftFrom?.message}
                                    {...checkout.register("giftFrom")}
                                />
                                <p className="type-body flex items-start gap-2 text-muted sm:col-span-2">
                                    <Info className="mt-0.5 size-4 shrink-0" />
                                    {t("gift-info")}
                                </p>
                            </div>
                        :   <p className="type-body flex items-start gap-2 text-muted">
                                <Info className="mt-0.5 size-4 shrink-0" />
                                {t("email-info")}
                            </p>
                        }
                    </fieldset>

                    <div className="rounded-md border-2 border-dashed border-hairline bg-canvas p-5 md:p-6">
                        <dl className="grid grid-cols-3 gap-4 border-b-2 border-dashed border-hairline pb-5">
                            {[
                                [t("page"), t("pages")],
                                [t("delivery"), t("by-email")],
                                [t("time"), t("instant")],
                            ].map(([label, value]) => (
                                <div key={label} className="min-w-0">
                                    <dt className="type-eyebrow truncate text-muted">
                                        {label}
                                    </dt>
                                    <dd className="type-label mt-1 text-ink">
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>

                        <div className="flex items-end justify-between gap-4 pt-5">
                            <span className="type-label text-ink">
                                {t("total")}
                            </span>
                            <span className="flex items-baseline gap-2">
                                {product === "PDF" && (
                                    <span className="type-body text-border-strong line-through">
                                        {formatAmountForDisplay(compareAtPrice)}
                                    </span>
                                )}
                                <span className="type-price text-[32px]! text-ink md:text-[40px]!">
                                    {formatAmountForDisplay(total)}
                                </span>
                            </span>
                        </div>

                        <button
                            type="submit"
                            className="button-primary mt-5 w-full"
                            disabled={checkout.formState.isSubmitting}
                        >
                            {checkout.formState.isSubmitting ?
                                <Loader2 className="size-5 animate-spin" />
                            :   t("submit")}
                        </button>

                        <p className="type-body mt-3 text-center font-bold text-ink">
                            ✨ {t("guarantee", { max: maxRedraws })}
                        </p>
                        <p className="type-body mt-1 flex items-center justify-center gap-1.5 text-muted">
                            <Lock className="size-3.5" />
                            {t("secure")}
                        </p>
                    </div>
                </form>
            )}
        </div>
    );
};

const StepHeading: React.FC<{ n: number; title: string; error?: string }> = ({
    n,
    title,
    error,
}) => (
    <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full border-2 border-navy bg-tomato font-display text-base font-bold text-white">
                {n}
            </span>
            <span className="type-title-md text-ink">{title}</span>
        </span>
        {error && <span className="type-body text-error">{error}</span>}
    </div>
);

const FieldLabel: React.FC<{ label: string; error?: string }> = ({
    label,
    error,
}) => (
    <span className="flex items-baseline justify-between gap-2">
        <span className="field-label">{label}</span>
        {error && <span className="type-body pb-1.5 text-error">{error}</span>}
    </span>
);

/** Radio/checkbox indicator: fills when the parent `.choice` is checked. */
const ChoiceMark: React.FC<{ square?: boolean }> = ({ square }) => (
    <span
        aria-hidden
        className={cn(
            "flex size-5 shrink-0 items-center justify-center border-2 border-border-strong [.choice:has(input:checked)_&]:border-navy [.choice:has(input:checked)_&]:bg-tomato",
            square ?
                "relative rounded-md"
            :   "absolute top-3 right-3 rounded-full"
        )}
    >
        <span className="size-2 rounded-full bg-white opacity-0 [.choice:has(input:checked)_&]:opacity-100" />
    </span>
);

export default NewBook;
