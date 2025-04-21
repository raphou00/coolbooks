"use client";

import { Lock } from "lucide-react";
import type { Image } from "@prisma/client";
import { cn } from "@/lib/utils";
import ImageEl from "./image";
import { useRouter } from "@/lib/navigation";

type GirlImageProps = {
    image: Image;
    bought: boolean;
    girlId: string;
    className?: string;
};

const BlurImage: React.FC<GirlImageProps> = ({
    image,
    bought,
    girlId,
    className,
}) => {
    const router = useRouter();
    const canSee = image.free || bought;
    const src = canSee ? image.src : image.blurred;

    return (
        <div className="relative rounded-xl overflow-hidden cursor-pointer size-full">
            <ImageEl
                src={src}
                alt="Girl"
                width={image.width}
                height={image.height}
                className={cn("rounded-xl", className)}
                onClick={() => {
                    if (!canSee) {
                        router.push("/payment/" + girlId);
                    }
                }}
            />
            {!canSee && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center size-10 bg-secondary rounded-full">
                    <Lock className="text-white size-5" />
                </div>
            )}
        </div>
    );
};

export default BlurImage;
