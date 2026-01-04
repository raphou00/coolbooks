"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn, getImage } from "@/lib/utils";

type NextImageProps = ImageProps & {
    isCover?: boolean;
};

const NextImage: React.FC<NextImageProps> = ({
    isCover = false,
    height,
    width,
    src,
    className,
    alt,
    ...rest
}) => {
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <div className={cn("relative overflow-hidden size-full", className)}>
            {!error ?
                <>
                    {isCover && (
                        <Image
                            className="absolute inset-0 z-0"
                            src="/images/3d_effect_cover.png"
                            width={height}
                            height={width}
                            alt="cover effect"
                        />
                    )}
                    <Image
                        className={cn(
                            "z-20 transition duration-300",
                            isLoading ? "blur-sm skeleton" : "blur-0"
                        )}
                        onLoad={() => setLoading(false)}
                        onError={() => {
                            setLoading(false);
                            setError(true);
                        }}
                        src={getImage(src as string)}
                        width={height}
                        height={width}
                        loading="lazy"
                        decoding="async"
                        blurDataURL={undefined}
                        alt={alt}
                        {...rest}
                    />
                </>
            :   <div className="absolute inset-0 z-30 size-full bg-base-300 flex flex-col items-center justify-center gap-y-2 skeleton">
                    <div className="loading loading-lg loading-spinner" />
                </div>
            }
            <div className="absolute inset-0 z-30 size-full" />
        </div>
    );
};

export default NextImage;
