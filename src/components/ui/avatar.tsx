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
        <div className="avatar">
            <div
                className={cn(
                    "rounded-full ring ring-white/10 shadow from-primary/60 to-secondary/60 bg-gradient-to-br",
                    className
                )}
            >
                {userName ?
                    <span className="text-white size-full flex items-center justify-center">
                        {getInitials(userName)}
                    </span>
                :   <User className="size-full text-white" />}
            </div>
        </div>
    );
};

export default Avatar;
