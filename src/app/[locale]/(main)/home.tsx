"use client";

import Modal from "@/components/ui/modal";
import Title from "@/components/ui/title";
import { name } from "@/config/girl";
import { Link } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export const WelcomeModal: React.FC = () => {
    const t = useTranslations("pages.home");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const searchParams = useSearchParams();
    const newUser = searchParams.get("newUser");

    useEffect(() => {
        if (newUser === "true") {
            setIsOpen(true);
        }
    }, [newUser]);

    return (
        <>
            <Modal
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                className="z-100 w-full h-96"
            >
                <div className="p-5 flex flex-col items-center">
                    <Image
                        src="/pinksea-dark.svg"
                        alt="pinksea"
                        className="z-50 w-80 h-auto mb-6"
                        width={100}
                        height={100}
                    />
                    <Title
                        text={t("welcome-title", { name })}
                        className="text-3xl mb-6 text-center w-fit mx-auto"
                        underline
                    />
                    <p>
                        {t.rich("welcome-body", {
                            pricing: (chunk) => (
                                <Link
                                    href="/pricing"
                                    className="link link-primary"
                                >
                                    {chunk}
                                </Link>
                            ),
                        })}
                    </p>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="btn btn-primary w-full mt-6"
                    >
                        {t("welcome-close")}
                    </button>
                </div>
            </Modal>
        </>
    );
};
