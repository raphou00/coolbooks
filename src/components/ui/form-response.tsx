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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <div
                    className={cn(
                        "flex h-auto w-full items-center justify-center gap-2 rounded-box border-2 p-2",
                        success ?
                            "border-success bg-success/10"
                        :   "border-error bg-error/10"
                    )}
                >
                    {success ?
                        <Check className="text-success" />
                    :   <AlertCircle className="text-error" />}
                    <span
                        className={cn(success ? "text-success" : "text-error")}
                    >
                        {message}
                    </span>
                </div>
            </motion.div>
        )
    );
};

export default FormReponse;
