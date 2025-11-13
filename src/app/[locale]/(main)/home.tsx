"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
    useMotionTemplate,
    useMotionValue,
    motion,
    animate,
} from "framer-motion";
import { Goudy_Bookletter_1911 } from "next/font/google";
import { ArrowRight } from "lucide-react";
import type { User } from "lucia";
import { useTranslations } from "next-intl";
import { title } from "@/config/seo";
import { cn } from "@/lib/utils";
import Title from "@/components/ui/title";
import Modal from "@/components/ui/modal";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";

type HomeProps = {
    user: User | null;
};

type ThanksProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const font = Goudy_Bookletter_1911({
    subsets: ["latin"],
    weight: "400",
});

const COLORS_TOP = ["#6bc4d9", "#e89fdf"];

const Home: React.FC<HomeProps> = ({ user }) => {
    const t = useTranslations("pages.home");
    const color = useMotionValue(COLORS_TOP[0]);
    const searchParams = useSearchParams();
    const thanks = searchParams.get("success") === "true";
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
    const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

    return (
        <>
            <div className="space-y-5 pt-20">
                <div className="grid grid-cols-2 max-[780px]:grid-cols-1 place-items-center">
                    <div className="relative z-10 flex flex-col items-start">
                        <span className="inline-block rounded-full glass bg-accent/5 border border-neutral px-3 py-1.5 mb-3">
                            😍 {t("beta")}
                        </span>
                        <Title
                            text={title}
                            className={cn(
                                "text-7xl lg:text-8xl mx-auto w-fit m-0 font-bold",
                                font.className
                            )}
                            underline
                        />
                        <p className="my-6 max-w-xl text-left text-base leading-relaxed lg:text-xl lg:leading-relaxed">
                            {t("description")}
                        </p>
                        <motion.a
                            style={{
                                border,
                                boxShadow,
                            }}
                            whileHover={{
                                scale: 1.015,
                            }}
                            whileTap={{
                                scale: 0.985,
                            }}
                            href={
                                user ? "/studio/new" : (
                                    "/login?redirect=/studio/new"
                                )
                            }
                            className="group relative text-white flex w-fit items-center gap-1.5 rounded-full bg-gray-950/90 backdrop-blur-3xl px-4 py-2 transition-colors cursor-pointer hover:bg-gray-950/90"
                        >
                            {t("create")}
                            <ArrowRight className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" />
                        </motion.a>
                    </div>
                    <div className="home-container size-[400px] max-lg:size-[300px] max-[780px]:!hidden">
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
    }, []);

    return (
        <Modal isOpen={open} setIsOpen={setOpen}>
            <div className="text-center px-6 py-8 mx-auto">
                <div className="text-6xl mb-4">🎉</div>
                <Title
                    text={t("title")}
                    underline
                    className="text-2xl w-fit mx-auto"
                />

                <p className="text-sm text-gray-600 my-6">{t("subtitle")}</p>

                <p className="mb-8 leading-relaxed">{t("message")}</p>

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

                <div className="flex flex-col sm:flex-row gap-3">
                    <Link href="/studio/new" className="btn btn-primary w-1/2">
                        {t("cta-primary")}
                    </Link>
                    <Link href="/account/profile" className="btn w-1/2">
                        {t("cta-secondary")}
                    </Link>
                </div>
            </div>
        </Modal>
    );
};

export default Home;
