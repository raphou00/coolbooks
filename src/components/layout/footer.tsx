"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { title } from "@/config/seo";
import { useGetFooterLinks } from "@/config/links";

const Footer: React.FC = () => {
    const t = useTranslations();

    const footerLinks = useGetFooterLinks();

    return (
        <footer className="w-full max-w-8xl mx-auto my-10 space-y-8">
            <div className="w-full flex flex-wrap items-center justify-center gap-6 mt-8 p-2">
                {footerLinks.map((link) => (
                    <Link
                        key={link.path}
                        href={link.path}
                        target="_blank"
                        rel="noreferrer"
                        className="link link-hover"
                    >
                        {link.title}
                    </Link>
                ))}
            </div>

            <div className="w-full flex flex-col items-center justify-center">
                <div className="flex items-center gap-4">
                    <Link href="https://www.facebook.com/" target="_blank">
                        <Image
                            src="/images/icons/facebook.png"
                            alt=""
                            width={256}
                            height={256}
                            className="size-8"
                        />
                    </Link>
                    <Link href="https://www.instagram.com/" target="_blank">
                        <Image
                            src="/images/icons/instagram.png"
                            alt=""
                            width={256}
                            height={256}
                            className="size-8"
                        />
                    </Link>
                    <Link href="https://www.tiktok.com/" target="_blank">
                        <Image
                            src="/images/icons/tiktok.png"
                            alt=""
                            width={256}
                            height={256}
                            className="size-8"
                        />
                    </Link>
                </div>
            </div>

            <div className="w-full text-center text-lg text-neutral">
                &copy; {new Date().getFullYear()} {title}.{" "}
                {t("common.copyright")}.
            </div>
        </footer>
    );
};

export default Footer;
