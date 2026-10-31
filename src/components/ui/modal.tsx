"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ModalProps = {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    closeButton?: boolean;
    className?: string;
    children: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({
    isOpen,
    setIsOpen,
    closeButton = true,
    children,
    className,
}) => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape" && closeButton) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    });

    useEffect(() => {
        if (isOpen) {
            document.documentElement.style.overflow = "hidden";
        } else {
            document.documentElement.style.overflow = "";
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsOpen(!closeButton)}
                    className="fixed inset-0 z-100 flex h-dvh w-full items-end sm:items-center justify-center bg-[rgb(24_29_38/0.45)] p-0 sm:p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 16 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            "relative w-full sm:w-fit max-w-2xl max-h-[90dvh] overflow-y-auto cursor-default rounded-t-lg sm:rounded-lg bg-canvas p-6 pb-8 sm:p-8 shadow-[0_16px_48px_rgb(24_29_38/0.18)]",
                            className
                        )}
                    >
                        {closeButton && (
                            <button
                                className="button-icon absolute right-4 top-4 z-10 size-9!"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                        <div className="h-full relative">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
