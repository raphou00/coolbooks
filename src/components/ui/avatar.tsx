"use client";

import { cn } from "@/lib/utils";
import Image from "@/components/ui/image";

type AvatarProps = {
    src?: string | null;
    alt?: string | null;
    className?: string;
};

const gradients = [
    "bg-gradient-to-r from-green-300 via-blue-500 to-purple-600",
    "bg-gradient-to-l from-pink-300 via-purple-300 to-indigo-400",
    "bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100",
    "bg-gradient-to-r from-red-200 via-red-300 to-yellow-200",
    "bg-gradient-to-r from-green-200 via-green-300 to-blue-500",
    "bg-gradient-to-r from-indigo-300 to-purple-400",
    "bg-gradient-to-r from-green-200 to-green-500",
    "bg-gradient-to-r from-blue-100 via-blue-300 to-blue-500",
];

const getGradient = (name?: string) => {
    const hashCode = (str: string) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    };

    if (name) {
        const hash = hashCode(name);
        const index = hash % gradients.length;
        return gradients[Math.abs(index)];
    } else {
        return gradients[Math.floor(Math.random() * gradients.length)];
    }
};

const Avatar: React.FC<AvatarProps> = ({ src, alt, className }) => {
    return (
        <div className="avatar">
            <div className={cn("rounded-full", className)}>
                {src ?
                    <Image
                        src={src}
                        alt={alt || "avatar"}
                        className="size-full"
                        width={1024}
                        height={1024}
                    />
                :   <div className="flex size-full items-center justify-center bg-base-300">
                        <div
                            className={cn("size-full", getGradient(alt!))}
                        ></div>
                    </div>
                }
            </div>
        </div>
    );
};

export default Avatar;
