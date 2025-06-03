"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { title } from "@/config/seo";
import { useGetCardsLinks, useGetFooterLinks } from "@/config/links";
import LogoText from "@/components/ui/logo-text";

const Footer: React.FC = () => {
    const t = useTranslations();

    const footerLinks = useGetFooterLinks();
    const cards = useGetCardsLinks();

    return (
        <>
            <footer className="mt-10">
                <div className="mx-auto w-full text-sm max-w-8xl px-4 md:px-6 lg:px-8 xl:px-12">
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] items-stretch justify-between gap-y-10 sm:gap-x-6 md:flex md:flex-wrap">
                        <div className="col-span-full flex items-center justify-between gap-4 md:flex-col">
                            <Link href="/" className="flex items-center gap-2">
                                <LogoText className="w-auto h-10" />
                            </Link>
                        </div>

                        {footerLinks.map((section) => (
                            <div
                                key={section.title}
                                className="flex flex-col gap-2.5"
                            >
                                <p className="mb-1 uppercase font-bold">
                                    {section.title}
                                </p>

                                {section.links.map((link) => (
                                    <Link
                                        key={link.path}
                                        href={link.path}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="link link-hover text-sm"
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

export default Footer;
