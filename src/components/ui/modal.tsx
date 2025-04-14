"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { X } from "lucide-react";

type ModalProps = {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    className?: string;
    children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({
    isOpen,
    setIsOpen,
    children,
    className,
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(false)}
                    className="fixed inset-0 h-screen w-full flex items-center justify-center z-[10000000] cursor-pointer bg-base-300/20 backdrop-blur sm:p-2"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: "12.5deg" }}
                        animate={{ scale: 1, rotate: "0deg" }}
                        exit={{ scale: 0, rotate: "0deg" }}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            "relative w-fit max-w-2xl max-sm:w-screen max-sm:h-screen cursor-default rounded-2xl bg-base-100 p-6 shadow-2xl",
                            className
                        )}
                    >
                        <button
                            className="absolute right-0 top-0 m-2 btn btn-ghost btn-square btn-sm"
                            onClick={() => setIsOpen(false)}
                        >
                            <X />
                        </button>
                        <div className="relative z-10">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
