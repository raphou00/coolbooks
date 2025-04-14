"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import Image from "@/components/ui/image";
import Title from "./title";

type CarouselProps = {
    items: JSX.Element[];
    initialScroll?: number;
};

type Card = {
    id: string;
    src: string;
    name: string;
    tags: string[];
};

type CardProps = {
    card: Card;
    index: number;
    layout?: boolean;
};

export const Carousel: React.FC<CarouselProps> = ({
    items,
    initialScroll = 0,
}) => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    useEffect(() => {
        if (carouselRef.current) {
            carouselRef.current.scrollLeft = initialScroll;
            checkScrollability();
        }
    }, [initialScroll]);

    const checkScrollability = () => {
        if (carouselRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } =
                carouselRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
        }
    };

    const scrollLeft = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
        }
    };

    const scrollRight = () => {
        if (carouselRef.current) {
            carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
        }
    };

    return (
        <div className="relative w-full">
            <div
                className="flex w-full pt-2 overflow-x-scroll overscroll-x-auto pb-6 scroll-smooth [scrollbar-width:none]"
                ref={carouselRef}
                onScroll={checkScrollability}
            >
                <div
                    className={cn(
                        "absolute right-0 z-[1000] h-auto w-[5%] overflow-hidden bg-gradient-to-l"
                    )}
                ></div>

                <div
                    className={cn(
                        "flex flex-row justify-start gap-4",
                        "mx-auto"
                    )}
                >
                    {items.map((item, index) => (
                        <motion.div
                            initial={{
                                opacity: 0,
                                y: 20,
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                transition: {
                                    duration: 0.5,
                                    delay: 0.2 * index,
                                    ease: "easeOut",
                                    once: true,
                                },
                            }}
                            key={"card" + index}
                            className="last:pr-[5%] md:last:pr-[33%] rounded-3xl"
                        >
                            {item}
                        </motion.div>
                    ))}
                </div>
            </div>
            <div className="flex justify-center gap-4">
                <button
                    className="relative z-40 btn btn-sm btn-circle btn-outline"
                    onClick={scrollLeft}
                    disabled={!canScrollLeft}
                >
                    <ChevronLeft className="size-6" />
                </button>
                <button
                    className="relative z-40 btn btn-sm btn-circle btn-outline"
                    onClick={scrollRight}
                    disabled={!canScrollRight}
                >
                    <ChevronRight className="size-6" />
                </button>
            </div>
        </div>
    );
};

export const Card: React.FC<CardProps> = ({ card }) => {
    return (
        <Link href={"/" + card.id}>
            <div className="rounded-3xl bg-base-300 max-[500px]:w-[calc(100vw-2rem)] w-96 h-auto aspect-video overflow-hidden flex flex-col items-start justify-start relative z-10 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="absolute h-full top-0 inset-x-0 bg-gradient-to-b from-black/50 via-transparent to-transparent z-30 pointer-events-none" />
                <div className="relative z-40 p-8">
                    <Title
                        className="text-lg md:text-xl font-semibold max-w-xs text-white text-left [text-wrap:balance] mt-1"
                        text={card.name}
                    />
                    <p className="text-sm md:text-base text-left text-white font-bold">
                        {card.tags.map((tag) => `#${tag}`).join(" ")}
                    </p>
                </div>
                <Image
                    src={card.src}
                    alt={card.name}
                    className="object-cover absolute z-10 inset-0 user-select-none pointer-events-none"
                    sizes="100vw"
                    fill
                    loading="eager"
                    priority
                />
            </div>
        </Link>
    );
};
