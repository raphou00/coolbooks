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
            document.documentElement.style.overflow = "auto";
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
                    className="fixed inset-0 h-screen w-full flex items-center justify-center z-100 cursor-pointer bg-base-300/20 backdrop-blur sm:p-2"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: "12.5deg" }}
                        animate={{ scale: 1, rotate: "0deg" }}
                        exit={{ scale: 0, rotate: "0deg" }}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            "w-fit max-w-2xl max-sm:w-[calc(100%-1.5rem)] cursor-default rounded-2xl bg-base-100 shadow-xl p-4 pb-8",
                            className
                        )}
                    >
                        {closeButton && (
                            <div className="w-full flex justify-end">
                                <button
                                    className="btn btn-ghost btn-square btn-sm"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <X />
                                </button>
                            </div>
                        )}
                        <div className="h-full relative">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
