"use client";

import { Lilita_One } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Lilita_One({
    subsets: ["latin"],
    weight: "400",
});

type TitleProps = {
    text: string;
    className?: string;
    underline?: boolean;
};

const Title: React.FC<TitleProps> = ({
    text,
    className,
    underline = false,
}: TitleProps) => {
    return (
        <h1 className={cn("text-2xl", className, font.className)}>
            {text}
            {underline && (
                <>
                    <span className="block h-0.5 w-full bg-primary"></span>
                    <span className="block h-0.5 w-full bg-secondary translate-x-2"></span>
                </>
            )}
        </h1>
    );
};

export default Title;
