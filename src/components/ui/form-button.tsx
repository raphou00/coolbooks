"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type FormButtonProps = {
    title: string | React.ReactNode;
    loading?: boolean;
    className?: string;
};

const FormButton: React.FC<FormButtonProps> = ({
    title,
    loading,
    className,
}) => {
    return (
        <button
            type="submit"
            disabled={loading}
            className={cn("button-primary mt-2 w-full", className)}
        >
            {loading ?
                <Loader2 className="size-5 animate-spin" />
            :   title}
        </button>
    );
};

export default FormButton;
