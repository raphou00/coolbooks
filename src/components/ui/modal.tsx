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
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
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
                    className="fixed inset-0 h-screen w-full flex items-center justify-center z-[999] cursor-pointer bg-base-300/20 backdrop-blur sm:p-2"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: "12.5deg" }}
                        animate={{ scale: 1, rotate: "0deg" }}
                        exit={{ scale: 0, rotate: "0deg" }}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                            "relative z-[999] w-fit max-w-2xl max-sm:w-screen max-sm:h-screen cursor-default sm:rounded-2xl bg-base-100 p-6 shadow-xl",
                            className
                        )}
                    >
                        <button
                            className="absolute right-0 top-0 m-2 btn btn-ghost btn-square btn-sm z-50"
                            onClick={() => setIsOpen(false)}
                        >
                            <X />
                        </button>
                        <div className="relative z-[999]">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal;
