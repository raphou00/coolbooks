"use client";

import { Lock } from "lucide-react";
import type { Image } from "@prisma/client";
import { cn } from "@/lib/utils";
import ImageEl from "./image";
import type { User } from "lucia";

type GirlImageProps = {
    user: User | null;
    image: Image;
    className?: string;
};

const BlurImage: React.FC<GirlImageProps> = ({ user, image, className }) => {
    const canSee = image.free || user?.subscriptionStatus === "active";
    const src = canSee ? image.src : image.blurred;

    return (
        <div className="relative rounded-md overflow-hidden cursor-pointer size-full">
            <ImageEl
                src={src}
                alt="Girl"
                width={image.width}
                height={image.height}
                className={cn("", className)}
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
