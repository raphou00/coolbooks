"use client";

import Image from "next/image";
import { useEffect } from "react";
import {
    useMotionTemplate,
    useMotionValue,
    motion,
    animate,
} from "framer-motion";
import { Goudy_Bookletter_1911 } from "next/font/google";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { title } from "@/config/seo";
import Title from "@/components/ui/title";
import { cn } from "@/lib/utils";

const font = Goudy_Bookletter_1911({
    subsets: ["latin"],
    weight: "400",
});

const COLORS_TOP = ["#6366f2", "#ff00e6"];

const Home: React.FC = () => {
    const t = useTranslations("pages.home");
    const color = useMotionValue(COLORS_TOP[0]);

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
        <div className="space-y-10 pt-44 text-white">
            <Image
                src="/images/magical-forest--kid-reading-a-book.png"
                alt=""
                width={1920}
                height={1080}
                className="absolute top-0 left-0 object-cover w-screen -z-50 border-b border-neutral brightness-50 saturate-200 h-[550px]"
            />

            <div className="relative h-[350px]">
                <div className="relative z-10 flex flex-col items-start">
                    <span className="inline-block rounded-full glass border border-neutral px-3 py-1.5 mb-3">
                        😍 {t("beta")}
                    </span>
                    <Title
                        text={title}
                        className={cn(
                            "text-7xl md:text-8xl mx-auto w-fit m-0 font-bold",
                            font.className
                        )}
                        underline
                    />
                    <p className="my-6 max-w-xl text-center text-base leading-relaxed md:text-xl md:leading-relaxed">
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
                        href="/studio/new"
                        className="group relative flex w-fit items-center gap-1.5 rounded-full bg-gray-950/90 backdrop-blur-3xl px-4 py-2 transition-colors cursor-pointer hover:bg-gray-950/90"
                    >
                        {t("create")}
                        <ArrowRight className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" />
                    </motion.a>
                </div>
            </div>
        </div>
    );
};

export default Home;
