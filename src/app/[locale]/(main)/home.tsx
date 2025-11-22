"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
    useMotionTemplate,
    useMotionValue,
    motion,
    animate,
} from "framer-motion";
import { Lexend as Font } from "next/font/google";
import { ArrowRight } from "lucide-react";
import type { User } from "lucia";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import Title from "@/components/ui/title";
import Modal from "@/components/ui/modal";

type HomeProps = {
    user: User | null;
};

type ThanksProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const font = Font({
    subsets: ["latin"],
    weight: "900",
});

const COLORS_TOP = ["#6bc4d9", "#e89fdf"];

const Home: React.FC<HomeProps> = ({ user }) => {
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

    const border = useMotionTemplate`1px solid ${color}`;
    const boxShadow = useMotionTemplate`0px 8px 24px ${color}`;

    return (
        <>
            <div className="w-full bg-gradient-to-r from-green-100 via-primary/20 to-secondary/20 px-4 py-2 rounded-2xl">
                <div className="flex items-center justify-center text-center">
                    <span className="mr-2 text-lg">🎄</span>
                    <p className="max-sm:text-sm text-gray-800">
                        {t("banner-pricing")}{" "}
                        <Link href="/pricing" className="link font-extrabold">
                            {t("banner-pricing-link")}
                        </Link>
                    </p>
                </div>
            </div>
            <div className="space-y-5 mt-6">
                <div className="grid grid-cols-2 max-[780px]:grid-cols-1 place-items-center">
                    <div className="flex flex-col items-start">
                        <span className="inline-block rounded-full bg-primary/10 border border-neutral/5 px-3 py-1.5 mb-3">
                            😍 {t("beta")}
                        </span>
                        <Title
                            text={t("title")}
                            className={cn(
                                "text-2xl lg:text-5xl mx-auto w-fit m-0 font-bold",
                                font.className
                            )}
                        />
                        <p className="my-6 max-w-xl text-left text-base leading-relaxed lg:text-xl lg:leading-relaxed">
                            {t("description")}
                        </p>
                        <motion.a
                            style={{
                                border,
                                boxShadow,
                            }}
                            href={
                                user ? "/studio/new" : (
                                    "/login?redirect=/studio/new"
                                )
                            }
                            className="group text-white text-lg flex w-fit items-center gap-1.5 rounded-full px-6 py-3 transition cursor-pointer bg-slate-800/90  hover:bg-slate-800/90"
                        >
                            {t("create")}
                            <ArrowRight className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" />
                        </motion.a>
                    </div>
                    <div className="home-container size-[400px] max-lg:size-[250px] max-[780px]:!hidden">
                        <Image
                            src="/images/2-kid-reading-a-book.jpg"
                            alt=""
                            width={1080}
                            height={1080}
                        />
                    </div>
                </div>
            </div>
            <Thanks open={open} setOpen={setOpen} />
        </>
    );
};

export const Features: React.FC = () => {
    const t = useTranslations("pages.home.features");
    return (
        <section className="mt-10 md:mt-16">
            <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                <h2 className="max-w-lg text-3xl font-bold sm:text-4xl md:text-5xl">
                    {t("title")}
                    <div className="text-slate-400">{t("titleHighlight")}</div>
                </h2>
            </div>

            <div className="flex flex-col-reverse items-stretch gap-6 md:flex-row md:items-start">
                <div className="flex-1">
                    <div className="mb-4 grid w-full [90rem]:max-w-4xl grid-cols-12 gap-4 px-2 sm:px-0">
                        <motion.div
                            whileHover={{ scale: 0.98, rotate: "-1deg" }}
                            className="group relative col-span-12 min-h-[220px] overflow-hidden rounded-2xl bg-slate-100 p-6 sm:min-h-[240px] md:col-span-4 md:p-8"
                        >
                            <h3 className="mx-auto text-center text-2xl font-semibold sm:text-3xl">
                                <div>🌎</div>
                                {t("cards.everywhere.title")}
                            </h3>
                            <div className="absolute bottom-0 left-3 right-3 top-[5.5rem] translate-y-8 rounded-t-2xl bg-gradient-to-br from-violet-400 to-indigo-400 p-4 transition-transform duration-[250ms] group-hover:translate-y-4 group-hover:rotate-[2deg] sm:left-4 sm:right-4 sm:top-[7.5rem]">
                                <span className="block text-center font-semibold text-indigo-50">
                                    {t("cards.everywhere.body")}
                                </span>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 0.98, rotate: "-1deg" }}
                            className="group relative col-span-12 min-h-[220px] overflow-hidden rounded-2xl bg-slate-100 p-6 sm:min-h-[240px] md:col-span-8 md:p-8"
                        >
                            <h3 className="mx-auto text-center text-2xl font-semibold sm:text-3xl">
                                <div>🚀</div>
                                {t("cards.instant.title")}
                            </h3>
                            <div className="absolute bottom-0 left-3 right-3 top-[5.5rem] translate-y-8 rounded-t-2xl bg-gradient-to-br from-amber-400 to-orange-400 p-4 transition-transform duration-[250ms] group-hover:translate-y-4 group-hover:rotate-[2deg] sm:left-4 sm:right-4 sm:top-[7.5rem]">
                                <span className="block text-center font-semibold text-orange-50">
                                    {t("cards.instant.body")}
                                </span>
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid w-full [90rem]:max-w-4xl grid-cols-12 gap-4 px-2 sm:px-0">
                        <motion.div
                            whileHover={{ scale: 0.98, rotate: "-1deg" }}
                            className="group relative col-span-12 min-h-[220px] overflow-hidden rounded-2xl bg-slate-100 p-6 sm:min-h-[240px] md:col-span-8 md:p-8"
                        >
                            <h3 className="mx-auto text-center text-2xl font-semibold sm:text-3xl">
                                <div>🎨</div>
                                {t("cards.customizable.title")}
                            </h3>
                            <div className="absolute bottom-0 left-3 right-3 top-[5.5rem] translate-y-8 rounded-t-2xl bg-gradient-to-br from-green-400 to-emerald-400 p-4 transition-transform duration-[250ms] group-hover:translate-y-4 group-hover:rotate-[2deg] sm:left-4 sm:right-4 sm:top-[7.5rem]">
                                <span className="block text-center font-semibold text-emerald-50">
                                    {t("cards.customizable.body")}
                                </span>
                            </div>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 0.98, rotate: "-1deg" }}
                            className="group relative col-span-12 min-h-[220px] overflow-hidden rounded-2xl bg-slate-100 p-6 sm:min-h-[240px] md:col-span-4 md:p-8"
                        >
                            <h3 className="mx-auto text-center text-2xl font-semibold sm:text-3xl">
                                <div>🎓</div>
                                {t("cards.educational.title")}
                            </h3>
                            <div className="absolute bottom-0 left-3 right-3 top-[5.5rem] translate-y-8 rounded-t-2xl bg-gradient-to-br from-pink-400 to-red-400 p-4 transition-transform duration-[250ms] group-hover:translate-y-4 group-hover:rotate-[2deg] sm:left-4 sm:right-4 sm:top-[7.5rem]">
                                <span className="block text-center font-semibold text-red-50">
                                    {t("cards.educational.body")}
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                <div className="w-full max-[90rem]:hidden md:w-auto md:ml-4 rounded-2xl overflow-hidden">
                    <Image
                        src="/images/a-kid-holding-a-book--looking-on-the-right.jpg"
                        width={683}
                        height={1024}
                        alt="a-kid-holding-a-book--looking-on-the-right"
                        className="mx-auto my-0 w-auto max-h-[496px] rounded-2xl transition hover:scale-105 hover:rotate-1"
                        priority
                    />
                </div>
            </div>
        </section>
    );
};

export const HowItWorks: React.FC = () => {
    const t = useTranslations("pages.home.how-it-works");
    return (
        <section className="w-full py-12 sm:py-16 lg:py-20">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <Title
                    text={t("title")}
                    className="mx-auto w-fit text-2xl font-bold sm:text-3xl md:text-4xl"
                    underline
                />

                <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <article className="group rounded-2xl bg-slate-100 p-6 shadow-md ring-1 ring-neutral/20 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg">
                        <div className="mb-3 text-center text-3xl font-serif text-slate-800">
                            {t("card1.roman")}
                        </div>
                        <h3 className="text-center text-xl font-semibold text-slate-900">
                            {t("card1.heading")}
                        </h3>
                        <p className="mt-2 text-center text-slate-600">
                            {t("card1.text")}
                        </p>
                    </article>

                    <article className="group rounded-2xl bg-slate-100 p-6 shadow-md ring-1 ring-neutral/20 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg">
                        <div className="mb-3 text-center text-3xl font-serif text-slate-800">
                            {t("card2.roman")}
                        </div>
                        <h3 className="text-center text-xl font-semibold text-slate-900">
                            {t("card2.heading")}
                        </h3>
                        <p className="mt-2 text-center text-slate-600">
                            {t("card2.text")}
                        </p>
                    </article>

                    <article className="group rounded-2xl bg-slate-100 p-6 shadow-md ring-1 ring-neutral/20 transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg">
                        <div className="mb-3 text-center text-3xl font-serif text-slate-800">
                            {t("card3.roman")}
                        </div>
                        <h3 className="text-center text-xl font-semibold text-slate-900">
                            {t("card3.heading")}
                        </h3>
                        <p className="mt-2 text-center text-slate-600">
                            {t("card3.text")}
                        </p>
                    </article>
                </div>
            </div>
        </section>
    );
};

export const VelocityText: React.FC = () => {
    const t = useTranslations("pages.home.weekly-update");

    return (
        <div className="grid place-content-center mt-12 mb-8">
            <h1 className="text-center rounded-full bg-primary/20 border border-neutral/10 px-4 py-1.5 text-base md:text-xl lg:text-2xl">
                {t("first-part")}{" "}
                <span className="relative">
                    {t("surrounded")}
                    <svg
                        viewBox="0 0 286 73"
                        fill="none"
                        className="absolute -left-2 -right-2 -top-2 bottom-0 translate-y-1"
                    >
                        <motion.path
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            transition={{
                                duration: 1.25,
                                ease: "easeInOut",
                            }}
                            d="M142.293 1C106.854 16.8908 6.08202 7.17705 1.23654 43.3756C-2.10604 68.3466 29.5633 73.2652 122.688 71.7518C215.814 70.2384 316.298 70.689 275.761 38.0785C230.14 1.37835 97.0503 24.4575 52.9384 1"
                            stroke="#6bc4d9"
                            strokeWidth="5"
                        />
                    </svg>
                </span>{" "}
                {t("second-part")}
            </h1>
        </div>
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

export default Home;
