"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { cn, getImage } from "@/lib/utils";
import { useTranslations } from "next-intl";

const NextImage: React.FC<ImageProps> = ({
    height,
    width,
    src,
    className,
    alt,
    ...rest
}) => {
    const t = useTranslations("common");
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <div className={cn("relative overflow-hidden size-full", className)}>
            {!error ?
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
            :   <div className="absolute inset-0 z-30 size-full bg-base-300 flex flex-col items-center justify-center gap-y-2 skeleton">
                    <div className="loading loading-lg loading-spinner" />
                    <p>{t("generating")}</p>
                </div>
            }
            <div className="absolute inset-0 z-30 size-full" />
        </div>
    );
};

export default NextImage;
