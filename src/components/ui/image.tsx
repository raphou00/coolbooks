"use client";

import NextImage from "next/image";
import type { ImageProps } from "next/image";
import { cn, getImage } from "@/lib/utils";

const Image: React.FC<ImageProps> = ({
    height,
    width,
    src,
    className,
    alt,
    ...rest
}) => {
    return (
        <NextImage
            className={cn("transition duration-300", className)}
            src={getImage(src as string)}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            blurDataURL={typeof src === "string" ? src : undefined}
            alt={alt ? alt : ""}
            {...rest}
        />
    );
};

export default Image;
