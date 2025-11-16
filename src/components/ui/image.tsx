"use client";

import { useState } from "react";
import Image from "next/image";
import type { ImageProps } from "next/image";
import { cn, getImage } from "@/lib/utils";

const NextImage: React.FC<ImageProps> = ({
    height,
    width,
    src,
    className,
    alt,
    ...rest
}) => {
    const [isLoading, setLoading] = useState<boolean>(true);

    return (
        <div className={cn("relative overflow-hidden", className)}>
            <Image
                className={cn(
                    "z-20 transition duration-300 rounded-xl",
                    isLoading ? "blur-sm skeleton" : "blur-0"
                )}
                onLoad={() => setLoading(false)}
                src={getImage(src as string)}
                width={width}
                height={height}
                loading="lazy"
                decoding="async"
                blurDataURL={typeof src === "string" ? src : undefined}
                alt={alt ? alt : ""}
                {...rest}
            />
            <div className="absolute inset-0 z-30 size-full" />
        </div>
    );
};

export default NextImage;
