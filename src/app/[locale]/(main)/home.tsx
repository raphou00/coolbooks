"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
    AlertCircle,
    ArrowRight,
    BookOpen,
    FileText,
    Heart,
    Palette,
    Sparkles,
    Star,
    Users,
    Wand2,
} from "lucide-react";
import { compareAtPrice, price } from "@/config/stripe";
import { cn, formatAmountForDisplay } from "@/lib/utils";
import NewBook, { artStyleImages } from "@/components/ui/new";
import NextImage from "@/components/ui/image";
import Modal from "@/components/ui/modal";
import Boo from "@/components/ui/boo";

type BooksProps = {
    books: {
        id: string;
        title: string;
        cover: string;
        artStyle: string;
    }[];
};

const Home: React.FC<BooksProps> = ({ books }) => {
    return (
        <>
            <PaymentStatus />
            <div className="flex flex-col gap-16 pb-4 md:gap-24">
                <Hero books={books} />
                <HowItWorks />
                <CreateBook books={books} />
                <Examples books={books} />
                <Features />
                <CallToAction />
            </div>
        </>
    );
};

/** Small sticker-style label above section titles. */
const Tag: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className,
}) => (
    <span
        className={cn(
            "inline-flex w-fit items-center gap-2 rounded-full border-2 border-navy bg-white px-3.5 py-1 font-display text-sm font-semibold text-navy shadow-[0_3px_0_#23264a]",
            className
        )}
    >
        {children}
    </span>
);

/** Toy-box band: a crayon-coloured block with a thick outline. */
const Band: React.FC<{
    children: React.ReactNode;
    className?: string;
    id?: string;
}> = ({ children, className, id }) => (
    <section id={id} className="container-page">
        <div
            className={cn(
                "relative overflow-hidden rounded-lg border-[2.5px] border-navy card-pad shadow-[0_6px_0_#23264a] dark:border-outline dark:shadow-[0_6px_0_var(--cb-outline)]",
                className
            )}
        >
            {children}
        </div>
    </section>
);

const Squiggle: React.FC = () => (
    <svg
        viewBox="0 0 200 16"
        preserveAspectRatio="none"
        aria-hidden
        className="absolute -bottom-2 left-0 h-3 w-full text-sun md:-bottom-3 md:h-4"
    >
        <path
            d="M3 10 Q 20 2, 37 10 T 71 10 T 105 10 T 139 10 T 173 10 T 197 9"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
        />
    </svg>
);

/* ---------- Hero ---------- */

const Hero: React.FC<BooksProps> = ({ books }) => {
    const t = useTranslations("pages.home");
    const tLinks = useTranslations("links");
    const [first, second] = books;

    return (
        <section id="home" className="container-page pt-8 md:pt-16">
            <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
                <div className="lg:col-span-7">
                    <Tag>{t("hero.tag")}</Tag>
                    <h1 className="type-display-lg mt-6 text-balance text-ink">
                        {t.rich("hero.title", {
                            hl: (chunks) => (
                                <span className="relative inline-block whitespace-nowrap text-tomato">
                                    {chunks}
                                    <Squiggle />
                                </span>
                            ),
                        })}
                    </h1>
                    <p className="type-body-lg mt-6 max-w-xl text-body">
                        {t("hero.description")}
                    </p>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Link href="/#create-book" className="button-primary">
                            {t("hero.create")}
                        </Link>
                        <Link href="/#examples" className="button-secondary">
                            {tLinks("examples")}
                        </Link>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2">
                        <span className="font-display text-2xl font-bold text-ink tabular-nums">
                            {formatAmountForDisplay(price)}
                        </span>
                        <span className="type-body font-bold text-border-strong line-through tabular-nums">
                            {formatAmountForDisplay(compareAtPrice)}
                        </span>
                        <span className="rounded-full bg-sun px-3 py-0.5 font-display text-sm font-semibold text-navy">
                            {t("hero.offer")}
                        </span>
                    </div>
                </div>

                <div className="lg:col-span-5">
                    <HeroBoo message={t("hero.boo")} covers={[first, second]} />
                </div>
            </div>

            <ul className="mt-12 flex flex-wrap gap-3 md:mt-16 md:justify-center">
                {[
                    { icon: FileText, label: t("hero.pdf"), bg: "bg-butter" },
                    { icon: Palette, label: t("hero.style"), bg: "bg-ice" },
                    {
                        icon: Sparkles,
                        label: t("hero.personalized"),
                        bg: "bg-mint",
                    },
                ].map((item) => (
                    <li
                        key={item.label}
                        className={cn(
                            "flex items-center gap-2.5 rounded-full border-2 border-navy px-4 py-2 text-navy shadow-[0_3px_0_#23264a]",
                            item.bg
                        )}
                    >
                        <item.icon className="size-5" strokeWidth={2.25} />
                        <span className="type-label">{item.label}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
};

/** Four-point twinkle star, same shape as Boo's wink sparkle. */
const Twinkle: React.FC<{ className?: string; color: string }> = ({
    className,
    color,
}) => (
    <svg viewBox="0 0 24 24" aria-hidden className={cn("absolute", className)}>
        <path
            d="M12 1.5 Q13.6 10.4 22.5 12 Q13.6 13.6 12 22.5 Q10.4 13.6 1.5 12 Q10.4 10.4 12 1.5 Z"
            fill={color}
            stroke="#23264a"
            strokeWidth="1.8"
            strokeLinejoin="round"
        />
    </svg>
);

const Cloud: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 64 28" aria-hidden className={cn("absolute", className)}>
        <path
            d="M10 26 Q2 26 3 19 Q4 13 11 14 Q12 5 22 6 Q28 0 36 5 Q46 2 48 12 Q58 11 60 19 Q61 26 53 26 Z"
            fill="#fff"
            stroke="#23264a"
            strokeWidth="2.2"
            strokeLinejoin="round"
        />
    </svg>
);

const HeroCover: React.FC<{
    book: BooksProps["books"][number];
    className: string;
}> = ({ book, className }) => (
    <div
        className={cn(
            "absolute z-[5] overflow-hidden rounded-md border-[2.5px] border-navy bg-white p-1.5 shadow-[0_5px_0_#23264a]",
            className
        )}
    >
        <div className="aspect-square overflow-hidden rounded-[10px]">
            <NextImage
                src={book.cover}
                width={512}
                height={512}
                alt={book.title}
                isCover
            />
        </div>
    </div>
);

/**
 * Boo on a little sky-and-hill sticker scene, with a speech bubble aimed at
 * his head. The two latest covers tuck in at the edges when there are any.
 */
const HeroBoo: React.FC<{
    message: string;
    covers: (BooksProps["books"][number] | undefined)[];
}> = ({ message, covers: [first, second] }) => (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]">
        {/* backdrop disc */}
        <div className="absolute inset-[9%] overflow-hidden rounded-full border-[2.5px] border-navy bg-sky shadow-[0_6px_0_#23264a] dark:border-outline dark:shadow-[0_6px_0_var(--cb-outline)]">
            <Cloud className="left-[10%] top-[30%] w-[24%] opacity-95" />
            <Cloud className="right-[8%] top-[46%] w-[17%] opacity-95" />
            <div className="absolute -inset-x-[15%] -bottom-[38%] h-[70%] rounded-[50%] border-[2.5px] border-navy bg-grass" />
        </div>

        {first && (
            <HeroCover
                book={first}
                className="bottom-[4%] left-0 w-[30%] -rotate-[9deg]"
            />
        )}
        {second && (
            <HeroCover
                book={second}
                className="right-0 top-[10%] w-[27%] rotate-[8deg]"
            />
        )}

        <Twinkle
            color="#ffc93c"
            className="right-[4%] top-[2%] w-[9%] animate-twinkle"
        />
        <Twinkle
            color="#ff5a47"
            className="left-[2%] top-[46%] w-[6%] animate-twinkle [animation-delay:-1.1s]"
        />
        <Twinkle
            color="#ffc93c"
            className="bottom-[2%] right-[10%] w-[7%] animate-twinkle [animation-delay:-2.2s]"
        />

        {/* ground shadow, shrinks as Boo bobs up */}
        <div
            aria-hidden
            className="absolute bottom-[12.5%] left-[31%] z-[6] h-[4%] w-[38%] animate-bob-shadow rounded-[50%] bg-navy/25"
        />
        <div className="absolute left-[16%] top-[19%] z-10 w-[68%]">
            <Boo pose="wink" className="animate-bob" title="Boo" />
        </div>

        <p className="absolute left-0 top-[1%] z-20 max-w-[56%] -rotate-3 rounded-2xl border-[2.5px] border-navy bg-white px-4 py-2.5 text-center font-display text-base font-semibold leading-tight text-navy shadow-[0_4px_0_#23264a] sm:text-lg">
            {message}
            <span
                aria-hidden
                className="absolute -bottom-[10px] left-[68%] size-4 rotate-45 border-b-[2.5px] border-r-[2.5px] border-navy bg-white"
            />
        </p>
    </div>
);

/* ---------- How it works — sun band ---------- */

const HowItWorks: React.FC = () => {
    const t = useTranslations("pages.home");
    const steps = [1, 2, 3].map((n) => ({
        n,
        title: t(`how-it-works.step${n}.title` as never),
        description: t(`how-it-works.step${n}.description` as never),
    }));
    const bubbles = ["bg-tomato", "bg-sky", "bg-grass"];

    return (
        <Band id="how-it-works" className="bg-sun text-navy">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-col gap-4">
                    <Tag>{t("how-it-works.badge")}</Tag>
                    <h2 className="type-display-md max-w-xl text-balance">
                        {t("how-it-works.title")}
                    </h2>
                </div>
                <div className="hidden w-36 shrink-0 md:block">
                    <Boo pose="read" />
                </div>
            </div>

            <ol className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
                {steps.map((step, i) => (
                    <li
                        key={step.n}
                        className="rounded-md border-2 border-navy bg-white p-6 text-navy shadow-[0_4px_0_#23264a]"
                    >
                        <span
                            className={cn(
                                "flex size-11 items-center justify-center rounded-full border-2 border-navy font-display text-xl font-bold",
                                bubbles[i],
                                i === 0 ? "text-white" : "text-navy"
                            )}
                        >
                            {step.n}
                        </span>
                        <h3 className="type-title-md mt-5">{step.title}</h3>
                        <p className="type-body mt-2 text-[#4a4d6e]">
                            {step.description}
                        </p>
                    </li>
                ))}
            </ol>

            <Link
                href="/#create-book"
                className="button-on-dark mt-8 w-full sm:w-fit"
            >
                {t("hero.create")}
            </Link>
        </Band>
    );
};

/* ---------- Create book ---------- */

const CreateBook: React.FC<BooksProps> = ({ books }) => {
    const t = useTranslations("pages.home");
    const tCommon = useTranslations("common");
    const samples = books.slice(2, 4);

    return (
        <section id="create-book" className="container-page">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                <div className="lg:col-span-5">
                    <div className="lg:sticky lg:top-28">
                        <Tag className="bg-butter">
                            {t("create-book.badge")}
                        </Tag>
                        <h2 className="type-display-md mt-5 text-balance text-ink">
                            {t("create-book.title")}
                        </h2>
                        <p className="type-body-lg mt-4 max-w-md text-body">
                            {tCommon("description")}
                        </p>

                        {samples.length > 0 && (
                            <div className="mt-10 hidden grid-cols-2 gap-5 lg:grid">
                                {samples.map((book, i) => (
                                    <div
                                        key={book.id}
                                        className={cn(
                                            "rounded-md border-[2.5px] border-navy bg-white p-2 shadow-[0_5px_0_#23264a]",
                                            i === 0 ? "-rotate-3" : (
                                                "mt-10 rotate-3"
                                            )
                                        )}
                                    >
                                        <div className="aspect-square overflow-hidden rounded-[10px]">
                                            <NextImage
                                                src={book.cover}
                                                width={512}
                                                height={512}
                                                alt={book.title}
                                                isCover
                                            />
                                        </div>
                                        <p className="mt-2 truncate px-1 pb-1 font-display text-sm font-semibold text-navy">
                                            {book.title}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-7">
                    <NewBook />
                </div>
            </div>
        </section>
    );
};

/* ---------- Examples — sky band ---------- */

const Examples: React.FC<BooksProps> = ({ books }) => {
    const t = useTranslations("pages.home");
    const tNewBook = useTranslations("pages.new-book");
    const tilt = ["-rotate-2", "rotate-1", "-rotate-1", "rotate-2"];

    if (books.length === 0) return null;

    return (
        <Band id="examples" className="bg-sky text-navy">
            <Tag>{t("examples.badge")}</Tag>
            <h2 className="type-display-md mt-4">{t("examples.title")}</h2>

            <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-8">
                {books.map((book, i) => (
                    <Link
                        key={book.id}
                        href={`/book/${book.id}`}
                        className={cn(
                            "block rounded-md border-[2.5px] border-navy bg-white p-2 text-navy shadow-[0_5px_0_#23264a] transition-transform active:translate-y-1 sm:p-2.5",
                            tilt[i % tilt.length]
                        )}
                    >
                        <div className="aspect-square overflow-hidden rounded-[10px]">
                            <NextImage
                                src={book.cover}
                                width={512}
                                height={512}
                                alt={book.title}
                                isCover
                            />
                        </div>
                        <div className="px-1 pb-1 pt-2.5">
                            <h3 className="line-clamp-2 font-display text-[15px] font-semibold leading-tight sm:text-[17px]">
                                {book.title}
                            </h3>
                            <p className="mt-1 text-xs font-bold text-[#4a4d6e] sm:text-sm">
                                {artStyleImages[book.artStyle]}{" "}
                                {tNewBook(book.artStyle as never)}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </Band>
    );
};

/* ---------- Features ---------- */

const Features: React.FC = () => {
    const t = useTranslations("pages.home");
    const items = [
        { icon: Wand2, bg: "bg-tomato", fg: "text-white" },
        { icon: BookOpen, bg: "bg-sun", fg: "text-navy" },
        { icon: Sparkles, bg: "bg-sky", fg: "text-navy" },
        { icon: Heart, bg: "bg-peach", fg: "text-navy" },
        { icon: Users, bg: "bg-grass", fg: "text-navy" },
        { icon: Star, bg: "bg-berry", fg: "text-white" },
    ];

    return (
        <section id="features" className="container-page">
            <div className="max-w-2xl">
                <Tag className="bg-mint">{t("features.badge")}</Tag>
                <h2 className="type-display-md mt-5 text-balance text-ink">
                    {t("features.title")}
                </h2>
                <p className="type-body-lg mt-4 text-body">
                    {t("features.subtitle")}
                </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
                {items.map((item, i) => (
                    <div key={i} className="sticker p-6">
                        <span
                            className={cn(
                                "flex size-12 items-center justify-center rounded-2xl border-2 border-navy",
                                item.bg,
                                item.fg
                            )}
                        >
                            <item.icon className="size-6" strokeWidth={2.25} />
                        </span>
                        <h3 className="type-title-sm mt-5 text-ink">
                            {t(`features.feature${i + 1}.title` as never)}
                        </h3>
                        <p className="type-body mt-2 text-muted">
                            {t(`features.feature${i + 1}.description` as never)}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
};

/* ---------- Closing CTA — tomato band ---------- */

const CallToAction: React.FC = () => {
    const t = useTranslations("pages.home");

    return (
        <Band className="bg-tomato text-white">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div className="max-w-xl">
                    <h2 className="type-display-md text-balance">
                        {t("cta.title")}
                    </h2>
                    <p className="type-body-lg mt-4 text-white/90">
                        {t("cta.description")}
                    </p>
                    <Link
                        href="/#create-book"
                        className="button-on-dark mt-8 w-full sm:w-fit"
                    >
                        {t("hero.create")}
                        <ArrowRight className="size-5" />
                    </Link>
                </div>
                <div className="mx-auto w-44 shrink-0 md:mx-0 md:w-56">
                    <Boo pose="sleep" />
                </div>
            </div>
        </Band>
    );
};

/* ---------- Payment status modal ---------- */

const PaymentStatus: React.FC = () => {
    const t = useTranslations("pages.home.payment-status");
    const searchParams = useSearchParams();
    const paymentStatus = searchParams.get("payment_success");
    const [open, setOpen] = useState(paymentStatus ? true : false);
    const status = paymentStatus === "true";

    return (
        <Modal isOpen={open} setIsOpen={setOpen} className="w-full max-w-md">
            <div className="flex flex-col items-center gap-5 text-center">
                {status ?
                    <div className="w-36">
                        <Boo pose="wink" />
                    </div>
                :   <span className="flex size-14 items-center justify-center rounded-full border-2 border-navy bg-peach text-navy">
                        <AlertCircle className="size-7" />
                    </span>
                }

                <div>
                    <h2 className="type-title-lg text-ink">
                        {status ? t("success") : t("failed")}
                    </h2>
                    <p className="type-body mt-2 text-body">
                        {status ? t("success-message") : t("failed-message")}
                    </p>
                </div>

                <button
                    onClick={() => setOpen(false)}
                    className="button-primary w-full"
                >
                    {t("close")}
                </button>
            </div>
        </Modal>
    );
};

export default Home;
