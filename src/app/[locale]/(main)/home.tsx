"use client";

import Modal from "@/components/ui/modal";
import Title from "@/components/ui/title";
import { name } from "@/config/seo";
import Link from "next/link";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

export const WelcomeModal: React.FC = () => {
    const t = useTranslations("pages.home");
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [hasVisited, _setHasVisited] = useState<boolean>(() => {
        if (typeof localStorage === "undefined") return false;
        const hasVisited = localStorage.getItem("visited");
        if (hasVisited === null) {
            localStorage.setItem("visited", "true");
            return false;
        }
        return true;
    });

    useEffect(() => {
        if (!hasVisited) setIsOpen(true);
    }, [hasVisited]);

    return (
        <>
            <Modal
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                className="z-100 w-full"
            >
                <div className="p-5 flex flex-col items-center">
                    <Image
                        src="/images/welcome.png"
                        alt="favicon"
                        className="rounded-sm z-50 w-64 h-auto mb-6"
                        width={900}
                        height={650}
                    />
                    <Title
                        text={t("welcome-title", { name })}
                        className="text-3xl mb-6 text-center w-fit mx-auto"
                        underline
                    />
                    <p className="text-center">
                        {t.rich("welcome-body", {
                            login: (chunk) => (
                                <Link
                                    href="/login"
                                    className="link link-primary"
                                >
                                    {chunk}
                                </Link>
                            ),
                            register: (chunk) => (
                                <Link
                                    href="/register"
                                    className="link link-primary"
                                >
                                    {chunk}
                                </Link>
                            ),
                            pricing: (chunk) => (
                                <Link
                                    href="/pricing"
                                    className="link link-primary"
                                >
                                    {chunk}
                                </Link>
                            ),
                            n: () => <br />,
                        })}
                    </p>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="btn btn-primary text-white btn-wide mt-6 right-0"
                    >
                        {t("welcome-close")}
                    </button>
                </div>
            </Modal>
        </>
    );
};
