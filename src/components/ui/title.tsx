"use client";

import { cn } from "@/lib/utils";
import { Lexend as Font } from "next/font/google";

type TitleProps = {
    text: string;
    className?: string;
    underline?: boolean;
};

const font = Font({
    subsets: ["latin"],
    weight: "700",
});

const Title: React.FC<TitleProps> = ({
    text,
    className,
    underline = false,
}: TitleProps) => {
    return (
        <h1 className={cn("text-2xl", className, font.className)}>
            {text}
            {underline && (
                <div className="-mt-1.5 static z-0">
                    <span className="block h-[4px] w-full bg-primary"></span>
                    <span className="block h-[4px] w-full bg-secondary ml-2"></span>
                </div>
            )}
        </h1>
    );
};

export default Title;
