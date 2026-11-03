"use client";

import { motion } from "framer-motion";
import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type FormReponseProps = {
    success?: boolean;
    message?: string | null;
};

const FormReponse: React.FC<FormReponseProps> = ({ success, message }) => {
    return (
        message && (
            <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                role="status"
                className={cn(
                    "flex w-full items-start gap-2.5 rounded-sm border px-4 py-3 type-body",
                    success ?
                        "border-success-border/60 bg-mint/30 text-success"
                    :   "border-error/40 bg-peach/25 text-error"
                )}
            >
                {success ?
                    <Check className="mt-0.5 size-4 shrink-0" />
                :   <AlertCircle className="mt-0.5 size-4 shrink-0" />}
                <span>{message}</span>
            </motion.div>
        )
    );
};

export default FormReponse;
