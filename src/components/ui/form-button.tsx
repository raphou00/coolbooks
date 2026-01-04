"use client";

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
            className={cn("btn btn-primary mt-4 w-full border-4", className)}
        >
            {loading ?
                <span className="loading loading-spinner"></span>
            :   <span className="font-bold">{title}</span>}
        </button>
    );
};

export default FormButton;
