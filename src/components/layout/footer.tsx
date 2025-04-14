"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Languages, SunMoon } from "lucide-react";
import { Link } from "@/lib/navigation";
import { title } from "@/config/seo";
import {
    useGetCardsLinks,
    useGetFooterLinks,
    useGetSocialLinks,
} from "@/config/links";
import LogoText from "@/components/ui/logo-text";
import LocaleModal from "@/components/ui/locale-modal";

const Footer: React.FC = () => {
    const [localeOpen, setLocaleOpen] = useState<boolean>(false);
    const t = useTranslations();
    const { setTheme } = useTheme();

    const footerLinks = useGetFooterLinks();
    const socials = useGetSocialLinks();
    const cards = useGetCardsLinks();

    const toggleTheme = () => {
        setTheme((e) => (e === "dark" ? "light" : "dark"));
    };

    return (
        <>
            <footer className="mt-10">
                <div className="mx-auto w-full text-sm max-w-8xl px-4 md:px-6 lg:py-8 xl:px-12">
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

                    <div className="flex-col md:flex-row md:navbar mt-10 p-0 max-md:py-1 border-t border-b border-neutral/20 flex justify-between items-center">
                        <div className="navbar-start flex gap-x-2 max-md:w-full">
                            {socials.map((social) => (
                                <Link
                                    key={social.path}
                                    href={social.path}
                                    className="flex items-center"
                                >
                                    <div
                                        className="tooltip tooltip-secondary"
                                        data-tip={social.title}
                                    >
                                        <social.icon className="size-6" />
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="navbar-center flex justify-start md:justify-center items-center gap-x-2 max-md:w-full">
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

                        <div className="navbar-end flex max-md:justify-start gap-2 max-md:w-full">
                            <button
                                onClick={toggleTheme}
                                className="btn btn-circle btn-outline btn-sm"
                            >
                                <SunMoon className="size-5" />
                            </button>

                            <button
                                onClick={() => setLocaleOpen((e) => !e)}
                                className="btn btn-circle btn-outline btn-sm"
                            >
                                <Languages className="size-5" />
                            </button>
                        </div>
                    </div>

                    <div className="mt-2 flex items-center justify-center">
                        <p className="mt-4 text-muted-foreground">
                            <span>
                                &copy; {new Date().getFullYear()} {title}.{" "}
                                {t("common.copyright")}.
                            </span>
                        </p>
                    </div>
                </div>
            </footer>
            <LocaleModal open={localeOpen} setOpen={setLocaleOpen} />
        </>
    );
};

export default Footer;
