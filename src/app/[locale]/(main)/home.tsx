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
    BookOpenText,
    ChevronRightIcon,
    Heart,
    Rocket,
    Sparkles,
    Star,
    ThumbsUp,
    Users,
    Wand2,
    Zap,
} from "lucide-react";
import { price } from "@/config/stripe";
import { cn, formatAmountForDisplay } from "@/lib/utils";
import Title from "@/components/ui/title";
import NewBook, { artStyleImages } from "@/components/ui/new";
import NextImage from "@/components/ui/image";
import Modal from "@/components/ui/modal";
import { motion } from "framer-motion";

const font = Font({
    subsets: ["latin"],
    weight: "500",
});

type BooksProps = {
    books: {
        id: string;
        title: string;
        cover: string;
        artStyle: string;
    }[];
};

const Home: React.FC<BooksProps> = ({ books }) => {
    const t = useTranslations("pages.home");
    const tNewBook = useTranslations("pages.new-book");

    return (
        <>
            <PaymentStatus />
            <div className="absolute inset-0 w-full h-[calc(100vh+88px)] z-0 bg-secondary/30 [background-image:radial-gradient(88%_100%_at_top,var(--color-primary),rgba(255,255,255,0))]">
                <div className="custom-shape-divider-bottom-1767706513">
                    <svg
                        data-name="Layer 1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 1200 120"
                        preserveAspectRatio="none"
                    >
                        <path
                            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                            opacity=".25"
                            className="shape-fill"
                        ></path>
                        <path
                            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                            opacity=".5"
                            className="shape-fill"
                        ></path>
                        <path
                            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                            className="shape-fill"
                        ></path>
                    </svg>
                </div>
            </div>

            <div className="absolute left-0 w-full px-2 py-1 flex justify-center items-center bg-secondary/80 z-50">
                {t("banner")}
            </div>

            <section
                id="home"
                className="relative h-[calc(100vh-88px)] w-full max-w-2xl mx-auto flex flex-col justify-c items-center gap-y-8 pt-18 z-10 text-black"
            >
                <div className="flex flex-col justify-center items-center gap-y-2">
                    <div className="px-2 py-0.5 bg-secondary/20 glass border-2 border-neutral/10 rounded-full text-center">
                        {t("hero.rating")}
                    </div>
                    <h1
                        className={cn(
                            "relative text-3xl md:text-4xl lg:text-5xl text-center",
                            font.className
                        )}
                    >
                        {t("hero.title")}
                        <motion.div
                            className="absolute -z-10 -right-2 -top-8"
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 9, repeat: Infinity }}
                        >
                            <BookOpenText className="w-12 h-12 text-indigo-300 fill-indigo-100 rotate-12 drop-shadow-lg" />
                        </motion.div>
                        <motion.div
                            className="absolute -z-10 -left-2 -bottom-2"
                            animate={{ y: [0, -10, 0] }}
                            transition={{ duration: 8, repeat: Infinity }}
                        >
                            <Sparkles className="w-12 h-12 text-yellow-300 fill-yellow-100 -rotate-12 drop-shadow-lg" />
                        </motion.div>
                    </h1>
                    <p className="text-lg md:text-xl text-center">
                        {t("hero.description")}
                    </p>
                    <Link
                        href="/#create-book"
                        className="px-3 py-px h-12 rounded-full border-4 border-secondary bg-secondary/90 text-white flex justify-center items-center gap-2"
                    >
                        {t("hero.create")}
                        <span className="font-bold">
                            {formatAmountForDisplay(price)}
                        </span>
                        <span className="text-white/90 text-xs line-through">
                            {formatAmountForDisplay(price * 1.2)}
                        </span>
                    </Link>
                </div>

                <div className="relative">
                    <motion.img
                        src="/images/book.png"
                        alt=""
                        width={1000}
                        height={560}
                        className="w-full aspect-video max-w-md"
                        animate={{ y: [0, -30, 0] }}
                        transition={{ duration: 9, repeat: Infinity }}
                    />
                    <Image
                        src="/images/book-bed.png"
                        alt=""
                        width={1000}
                        height={600}
                        className="absolute -z-10 top-0 left-0 w-full aspect-video max-w-lg"
                    />
                    <motion.div
                        className="absolute -z-10 -left-16 top-0"
                        animate={{ y: [0, -35, 0] }}
                        transition={{ duration: 7, repeat: Infinity }}
                    >
                        <Zap className="w-12 h-12 text-blue-300 fill-blue-100 -rotate-12 drop-shadow-lg" />
                    </motion.div>
                    <motion.div
                        className="absolute -z-10 right-0 -bottom-4"
                        animate={{ y: [0, -30, 0] }}
                        transition={{ duration: 8, repeat: Infinity }}
                    >
                        <Rocket className="w-12 h-12 text-green-300 fill-green-100 -rotate-12 drop-shadow-lg" />
                    </motion.div>
                </div>

                <div>
                    <div className="flex flex-wrap justify-center gap-x-2 lg:gap-x-4 text-xl text-neutral rounded-field border border-neutral/20 bg-base-100/20 py-4">
                        <div className="w-fit flex items-center gap-x-2">
                            <span className="status status-success" />
                            <span>{t("hero.pdf")}</span>
                        </div>
                        <div className="w-fit flex items-center gap-x-2">
                            <span className="status status-secondary" />
                            <span>{t("hero.style")}</span>
                        </div>
                        <div className="w-fit flex items-center gap-x-2">
                            <span className="status status-primary" />
                            <span>{t("hero.personalized")}</span>
                        </div>
                    </div>
                </div>
            </section>

            <section
                id="create-book"
                className="relative flex flex-col items-center justify-center gap-y-2 min-h-screen w-full pt-32"
            >
                <div className="badge badge-xl badge-secondary rounded-4xl">
                    {t("createBook.badge")}
                </div>
                <Title
                    text={t("createBook.title")}
                    className="text-3xl lg:text-4xl"
                />

                <div className="size-full">
                    <NewBook />
                </div>
            </section>

            <section
                id="examples"
                className="flex flex-col justify-center items-center gap-y-4 pt-16"
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
                                    <div className="absolute right-0 bottom-0 badge badge-secondary badge-lg gap-x-1">
                                        {artStyleImages[book.artStyle]}{" "}
                                        {tNewBook(book.artStyle as any)}
                                    </div>
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
