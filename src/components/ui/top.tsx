"use client";

import { useEffect } from "react";
import Image from "next/image";
import { type Creator } from "@prisma/client";
import { formatAmountForDisplay } from "@/lib/utils";
import { Link } from "@/lib/navigation";
import { useCurrency } from "@/hook/use-currency";

type TopProps = {
    top: Creator[];
};

const Top: React.FC<TopProps> = ({ top }) => {
    const { convert, currency } = useCurrency();

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("animate-fadeIn");
                }
            });
        });

        const elements = document.querySelectorAll(".animate-fadein-el");
        elements.forEach((element) => {
            observer.observe(element);
        });

        return () => {
            elements.forEach((element) => {
                observer.unobserve(element);
            });
        };
    }, []);

    return (
        <div className="overflow-x-auto max-w-4xl mx-auto space-y-2">
            {top.map((creator) => (
                <div
                    key={creator.id}
                    className="flex items-center justify-between gap-x-4 bg-base-200 p-4 rounded-2xl w-full animate-fadein-el animate-fadein"
                >
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="mask mask-squircle size-14 md:size-20">
                                <Image
                                    src={creator.avatar}
                                    alt={creator.name}
                                    width={256}
                                    height={256}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="font-bold">{creator.name}</div>
                            <div className="text-sm opacity-50">
                                {creator.origin}
                            </div>
                        </div>
                        <div className="font-bold text-lg text-neutral ml-2">
                            {formatAmountForDisplay(
                                convert(creator.price),
                                currency
                            )}
                        </div>
                    </div>
                    <Link
                        href={`/creators/${creator.id}`}
                        className="btn btn-secondary btn-active mr-2 hidden md:flex"
                    >
                        Visit!
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default Top;
