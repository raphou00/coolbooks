"use client";

import { cn } from "@/lib/utils";
import { User, User2 } from "lucide-react";

type AvatarProps = {
    className?: string;
};

const Avatar: React.FC<AvatarProps> = ({ className }) => {
    return (
        <div className="avatar">
            <div className={cn("rounded-full bg-accent/70", className)}>
                <User className="size-full text-white" />
            </div>
        </div>
    );
};

export default Avatar;
