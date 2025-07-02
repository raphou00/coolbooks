"use client";

import { Archivo_Black } from "next/font/google";
import { cn } from "@/lib/utils";

const font = Archivo_Black({
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
                <div className="-mt-1.5 static z-0">
                    <span className="block h-[3px] w-full bg-primary"></span>
                    <span className="block h-[3px] w-full bg-secondary ml-2"></span>
                </div>
            )}
        </h1>
    );
};

export default Title;
