"use client";

import { cn } from "@/lib/utils";
import { User } from "lucide-react";

type AvatarProps = {
    userName?: string;
    className?: string;
};

const Avatar: React.FC<AvatarProps> = ({ userName, className }) => {
    const getInitials = (username: string) => {
        if (!username) return "";
        const parts = username.trim().split(/\s+/);
        if (parts.length === 1) {
            return parts[0][0].toUpperCase();
        }
        return (parts[0][0] + parts[1][0]).toUpperCase();
    };

    return (
        <span
            className={cn(
                "inline-flex shrink-0 items-center justify-center rounded-full border-2 border-navy bg-sun font-display font-semibold text-navy",
                className
            )}
        >
            {userName ? getInitials(userName) : <User className="size-1/2" />}
        </span>
    );
};

export default Avatar;
