"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DynaPuff as Font } from "next/font/google";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
    AlertCircle,
    BookOpen,
    ChevronRightIcon,
    Heart,
    Sparkles,
    Star,
    ThumbsUp,
    Users,
    Wand2,
} from "lucide-react";
import { price } from "@/config/stripe";
import { cn, formatAmountForDisplay } from "@/lib/utils";
import Title from "@/components/ui/title";
import NewBook from "@/components/ui/new";
import NextImage from "@/components/ui/image";
import Modal from "@/components/ui/modal";

const font = Font({
    subsets: ["latin"],
    weight: "500",
});

type BooksProps = {
    books: {
        id: string;
        title: string;
        cover: string;
    }[];
};

const Home: React.FC<BooksProps> = ({ books }) => {
    const t = useTranslations("pages.home");

    return (
        <>
            <PaymentStatus />
            <Image
                src="/images/home.png"
                alt=""
                className="absolute inset-0 h-[calc(100vh/1.3)] w-screen object-cover z-0 brightness-90"
                width={1920}
                height={960}
            />
            <section
                id="home"
                className="relative h-[calc(100vh/1.5)] flex flex-col justify-between pt-6 z-10 mb-6! text-black"
            >
                <div className="flex flex-col justify-censter items-center gap-y-2">
                    <div className="px-2 py-0.5 bg-secondary/20 glass border-2 border-neutral/10 rounded-full text-center">
                        {t("hero.chip")}
                    </div>
                    <Title
                        className={cn(
                            "text-4xl md:text-5xl lg:text-6xl my-2 tracking-tight text-center text-balance",
                            font.className
                        )}
                        text={t("hero.title")}
                    />
                    <p className="text-lg md:text-xl text-center leading-relaxed max-w-xl">
                        {t("hero.description")}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/#create-book"
                            className="btn btn-xl h-12 rounded-full border-4 border-secondary bg-white text-black flex items-center group"
                        >
                            <span className="text-lg">
                                {t("hero.create")}{" "}
                                {formatAmountForDisplay(price)}
                            </span>
                            <ChevronRightIcon className="transition group-hover:translate-x-2" />
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col justify-center gap-4 p-4 text-sm text-neutral rounded-field border border-neutral/20 bg-base-100/80 w-fit mx-auto">
                    <div className="flex items-center justify-center gap-x-px lg:gap-x-2">
                        <div className="rating rating-lg rating-half">
                            <div className="mask mask-star-2 mask-half-1 bg-yellow-500" />
                            <div className="mask mask-star-2 mask-half-2 bg-yellow-500" />
                            <div className="mask mask-star-2 mask-half-1 bg-yellow-500" />
                            <div className="mask mask-star-2 mask-half-2 bg-yellow-500" />
                            <div className="mask mask-star-2 mask-half-1 bg-yellow-500" />
                            <div className="mask mask-star-2 mask-half-2 bg-yellow-500" />
                            <div className="mask mask-star-2 mask-half-1 bg-yellow-500" />
                            <div className="mask mask-star-2 mask-half-2 bg-yellow-500" />
                            <div
                                className="mask mask-star-2 mask-half-1 bg-yellow-500"
                                aria-current="true"
                            />
                            <div className="mask mask-star-2 mask-half-2 bg-yellow-500" />
                        </div>
                        {t("hero.rating")}
                    </div>
                    <div className="flex justify-center gap-x-px lg:gap-x-4">
                        <div className="flex items-center gap-x-2">
                            <span className="status status-success" />
                            <span>{t("hero.pdf")}</span>
                        </div>
                        <div className="flex items-center gap-x-2">
                            <span className="status status-secondary" />
                            <span>{t("hero.style")}</span>
                        </div>
                        <div className="flex items-center gap-x-2">
                            <span className="status status-primary" />
                            <span>{t("hero.personalized")}</span>
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="examples"
                className="flex flex-col justify-center items-center gap-y-4 pt-14"
            >
                <div className="badge badge-xl badge-secondary rounded-4xl">
                    {t("examples.badge")}
                </div>
                <Title
                    className="text-3xl lg:text-4xl text-center"
                    text={t("examples.title")}
                />
                <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-x-4 lg:gap-x-12 gap-y-8 overflow-x-auto scrollbar-hide scroll-smooth">
                    {books.map((book) => (
                        <div key={book.id} className="relative flex-shrink-0">
                            <Link href={`/book/${book.id}`}>
                                <div className="relative aspect-square shadow-lg rounded-box overflow-hidden">
                                    <NextImage
                                        className=""
                                        src={book.cover}
                                        width={1024}
                                        height={1024}
                                        alt={book.title}
                                        isCover
                                    />
                                </div>
                                <div className="flex justify-center items-center text-sm lg:text-base font-bold mt-2">
                                    <h2 className="text-left truncate w-full">
                                        {book.title}
                                    </h2>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </section>

            <section
                id="create-book"
                className="relative flex flex-col items-center justify-center gap-y-2 min-h-screen w-full pt-24"
            >
                <div className="badge badge-xl badge-secondary rounded-4xl">
                    {t("createBook.badge")}
                </div>
                <Title
                    text={t("createBook.title")}
                    className="text-3xl lg:text-4xl"
                />

                <div className="bg-secondary/5 rounded-3xl px-2 sm:px-6 md:px-12 py-8 m-2 w-full max-w-2xl mx-auto">
                    <NewBook />
                </div>
            </section>

            <section id="how-it-works" className="pt-24">
                <div className="bg-secondary/30 rounded-box px-8 py-16">
                    <div className="text-center space-y-4 mb-8">
                        <div className="badge badge-xl badge-secondary rounded-4xl">
                            {t("howItWorks.badge")}
                        </div>
                        <Title
                            className="text-4xl md:text-5xl font-bold tracking-tight text-balance"
                            text={t("howItWorks.title")}
                        />
                    </div>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                step: "01",
                                title: t("howItWorks.step1.title"),
                                description: t("howItWorks.step1.description"),
                            },
                            {
                                step: "02",
                                title: t("howItWorks.step2.title"),
                                description: t("howItWorks.step2.description"),
                            },
                            {
                                step: "03",
                                title: t("howItWorks.step3.title"),
                                description: t("howItWorks.step3.description"),
                            },
                        ].map((step, i) => (
                            <div key={i} className="relative">
                                <div className="text-7xl max-md:text-center font-bold text-primary mb-4">
                                    {step.step}
                                </div>
                                <h3 className="text-2xl max-md:text-center font-semibold mb-3">
                                    {step.title}
                                </h3>
                                <p className="text-muted-foreground max-md:text-center max-w-sm mx-auto leading-relaxed">
                                    {step.description}
                                </p>
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-12 -right-4 w-8 h-0.5 bg-border" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="features" className="pt-24">
                <div className="text-center space-y-4 mb-12">
                    <div className="badge badge-xl badge-secondary rounded-4xl">
                        {t("features.badge")}
                    </div>
                    <Title
                        className="text-4xl md:text-5xl"
                        text={t("features.title")}
                    />
                    <p className="text-lg max-w-2xl mx-auto">
                        {t("features.subtitle")}
                    </p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[
                        {
                            icon: Wand2,
                            title: t("features.feature1.title"),
                            description: t("features.feature1.description"),
                        },
                        {
                            icon: BookOpen,
                            title: t("features.feature2.title"),
                            description: t("features.feature2.description"),
                        },
                        {
                            icon: Sparkles,
                            title: t("features.feature3.title"),
                            description: t("features.feature3.description"),
                        },
                        {
                            icon: Heart,
                            title: t("features.feature4.title"),
                            description: t("features.feature4.description"),
                        },
                        {
                            icon: Users,
                            title: t("features.feature5.title"),
                            description: t("features.feature5.description"),
                        },
                        {
                            icon: Star,
                            title: t("features.feature6.title"),
                            description: t("features.feature6.description"),
                        },
                    ].map((feature, i) => (
                        <div
                            key={i}
                            className="border-2 border-neutral/20 hover:border-primary/50 rounded-box transition-all hover:shadow-lg"
                        >
                            <div className="p-6 space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold">
                                    {feature.title}
                                </h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="pt-24">
                <div className="bg-primary/50 rounded-box shadow-xl overflow-hidden">
                    <div className="p-12 md:p-16 text-center space-y-6">
                        <Title
                            className="text-4xl md:text-5xl font-bold tracking-tight text-balance"
                            text={t("cta.title")}
                        />
                        <p className="text-lg md:text-xl text-primary-foreground/90 max-w-2xl mx-auto leading-relaxed">
                            {t("cta.description")}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Link
                                href="/#create-book"
                                className="btn btn-xl h-12 rounded-full border-4 border-secondary bg-white text-black flex items-center group"
                            >
                                <span className="text-lg">
                                    {t("hero.create")}
                                </span>
                                <ChevronRightIcon className="transition group-hover:translate-x-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

const PaymentStatus: React.FC = () => {
    const t = useTranslations("pages.home.payment-status");
    const searchParams = useSearchParams();
    const paymentStatus = searchParams.get("payment_success");
    const [open, setOpen] = useState(paymentStatus ? true : false);
    const status = paymentStatus === "true" ? true : false;

    return (
        <Modal
            isOpen={open}
            setIsOpen={setOpen}
            className="overflow-hidden z-100 w-full max-w-lg"
        >
            <Image
                src={status ? "/images/success.svg" : "/images/error.svg"}
                alt=""
                width={200}
                height={200}
                className="-rotate-12 size-56 absolute z-0 -top-28 -left-10 opacity-50 saturate-50"
            />
            <div className="relative flex flex-col justify-center items-center gap-y-4">
                {status ?
                    <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:size-20">
                        <ThumbsUp
                            aria-hidden="true"
                            className="size-10 text-success"
                        />
                    </div>
                :   <div className="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:size-20">
                        <AlertCircle
                            aria-hidden="true"
                            className="size-10 text-error"
                        />
                    </div>
                }

                <div className="mt-3 text-center">
                    <Title text={status ? t("success") : t("failed")} />

                    <p className="text-sm text-neutral max-w-lg">
                        {status ? t("success-message") : t("failed-message")}
                    </p>
                </div>

                <div className="mt-5 sm:mt-4">
                    <button
                        onClick={() => setOpen(false)}
                        className="btn btn-primary"
                    >
                        {t("close")}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default Home;
