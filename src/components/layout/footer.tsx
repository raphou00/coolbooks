"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { title } from "@/config/seo";
import { useGetCardsLinks, useGetFooterLinks } from "@/config/links";
import Logo from "@/components/ui/logo";

const Footer: React.FC = () => {
    const t = useTranslations();

    const footerLinks = useGetFooterLinks();
    const cards = useGetCardsLinks();

    return (
        <>
            <footer className="mt-10 sticky z-60 border-t border-neutral/50 pt-10">
                <div className="mx-auto w-full text-sm max-w-8xl px-4 md:px-6 lg:px-8 xl:px-12">
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] items-stretch justify-between gap-y-10 sm:gap-x-6 md:flex md:flex-wrap">
                        <div className="flex items-start justify-start flex-col gap-4">
                            <Link href="/" className="flex items-center gap-2">
                                <Logo className="w-auto h-16" />
                            </Link>
                            <div className="flex flex-col items-start gap-3">
                                <div className="flex items-center">
                                    <p></p>
                                    <Link
                                        href="mailto:coolbooks.app@gmail.com"
                                        className="link text-xs truncate"
                                    >
                                        coolbooks.app@gmail.com
                                    </Link>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="https://www.facebook.com/profile.php?viewas=100000686899395&id=61584008510579&locale=fr_FR"
                                        target="_blank"
                                    >
                                        <Image
                                            src="/images/icons/facebook.png"
                                            alt=""
                                            width={256}
                                            height={256}
                                            className="size-8"
                                        />
                                    </Link>
                                    <Link
                                        href="https://www.instagram.com/"
                                        target="_blank"
                                    >
                                        <Image
                                            src="/images/icons/instagram.png"
                                            alt=""
                                            width={256}
                                            height={256}
                                            className="size-8"
                                        />
                                    </Link>
                                    <Link
                                        href="https://www.tiktok.com/"
                                        target="_blank"
                                    >
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
                        </div>

                        {footerLinks.map((section) => (
                            <div
                                key={section.title}
                                className="flex flex-col gap-2.5"
                            >
                                <p className="mb-1 uppercase font-bold text-lg">
                                    {section.title}
                                </p>

                                {section.links.map((link) => (
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
                        ))}
                    </div>

                    <div className="flex-col mt-10 p-0 max-md:py-1 border-t border-b border-neutral/20 flex justify-between items-center">
                        <div className="navbar-center flex justify-center items-center gap-x-2">
                            {cards.map((card) => (
                                <Image
                                    key={card.icon}
                                    src={card.icon}
                                    alt={card.title}
                                    width={256}
                                    height={256}
                                    className="size-10"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="my-4 flex items-center justify-center">
                        <p className="text-muted-foreground">
                            <span>
                                &copy; {new Date().getFullYear()} {title}.{" "}
                                {t("common.copyright")}.
                            </span>
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
};

const Instagram: React.FC = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            className="size-6 group"
        >
            <path
                className="fill-base-content transition-all group-hover:fill-primary"
                d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
            />
        </svg>
    );
};

const Tiktok: React.FC = () => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 448 512"
            className="size-6 group"
        >
            <path
                className="fill-base-content transition-all group-hover:fill-primary"
                d="M448 209.9a210.1 210.1 0 0 1 -122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z"
            />
        </svg>
    );
};

export default Footer;
