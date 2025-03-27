"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Currency } from "@prisma/client";
import { Languages, SunMoon } from "lucide-react";
import { title } from "@/config/seo";
import { locales, localesTitle } from "@/lib/navigation";
import { type ExchangeRateApiKey, useCurrency } from "@/hook/use-currency";
import useSwitchLocale from "@/hook/use-switch-locale";
import {
    useGetCardsLinks,
    useGetFooterLinks,
    useGetSocialLinks,
} from "@/config/links";
import LogoText from "@/components/ui/logo-text";
import Modal from "@/components/ui/modal";
import Title from "@/components/ui/title";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectValue,
    SelectTrigger,
} from "@/components/ui/select";

const Footer: React.FC = () => {
    const [localeOpen, setLocaleOpen] = useState<boolean>(false);
    const t = useTranslations();
    const switchLocale = useSwitchLocale();
    const locale = useLocale();
    const { setTheme } = useTheme();
    const { currency, setCurrency } = useCurrency();

    const footerLinks = useGetFooterLinks();
    const socials = useGetSocialLinks();
    const cards = useGetCardsLinks();

    const toggleTheme = () => {
        setTheme((e) => (e === "dark" ? "light" : "dark"));
    };

    return (
        <>
            <footer className="py-10">
                <div className="mx-auto w-full text-sm max-w-8xl px-4 md:px-6 lg:py-8 xl:px-12">
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] items-stretch justify-between gap-y-10 sm:gap-x-6 md:flex md:flex-wrap">
                        <div className="col-span-full flex items-center justify-between gap-4 md:flex-col">
                            <Link href="/" className="flex items-center gap-2">
                                <LogoText />
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

                    <div className="flex-col md:flex-row md:navbar mt-10 p-0 max-md:py-1 border-t border-b border-neutral/50 flex justify-between items-center">
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
            <Modal
                isOpen={localeOpen}
                setIsOpen={setLocaleOpen}
                className="z-100 w-full"
            >
                <div className="flex flex-col items-center justify-center mx-auto gap-y-6 w-full max-w-lg p-6">
                    <Title
                        text={t("links.language-currency")}
                        className="text-3xl mb-6"
                        underline
                    />

                    <div className="w-full">
                        <p className="mb-1 ml-1">{t("links.language")}</p>
                        <Select
                            defaultValue={locale}
                            value={locale}
                            onValueChange={(l) => switchLocale(l)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    placeholder={t("links.language")}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {locales.map((l) => (
                                        <SelectItem key={l} value={l}>
                                            <div className="flex items-center gap-2">
                                                <Image
                                                    src={`/images/locales/${l}.png`}
                                                    alt={l}
                                                    width={32}
                                                    height={32}
                                                    className="size-6"
                                                />
                                                {
                                                    localesTitle[
                                                        l as keyof typeof localesTitle
                                                    ]
                                                }
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-full">
                        <p className="mb-1 ml-1">{t("links.currency")}</p>
                        <Select
                            defaultValue={currency}
                            value={currency}
                            onValueChange={(c: ExchangeRateApiKey) =>
                                setCurrency(c)
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    placeholder={t("links.currency")}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {Object.values(Currency).map((c) => (
                                        <SelectItem key={c} value={c}>
                                            <div className="flex items-center gap-2">
                                                <Image
                                                    src={`/images/currencies/${c}.svg`}
                                                    alt={c}
                                                    width={32}
                                                    height={32}
                                                    className="size-6"
                                                />
                                                {c}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Footer;
