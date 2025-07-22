"use client";

// import { useState } from "react";
import Image from "next/image";
import type { ImageProps } from "next/image";
import { cn, getImage } from "@/lib/utils";

const BlurImage: React.FC<ImageProps> = ({
    height,
    width,
    src,
    className,
    alt,
    ...rest
}) => {
    // const [isLoading, setLoading] = useState<boolean>(true);

    return (
        <Image
            className={cn(
                "transition duration-300",
                // isLoading ? "blur-sm" : "blur-0",
                className
            )}
            // onLoad={() => setLoading(false)}
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

export default BlurImage;
