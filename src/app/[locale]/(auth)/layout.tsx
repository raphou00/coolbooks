"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Currency } from "@prisma/client";
import { Home, Languages, SunMoon } from "lucide-react";
import { locales, localesTitle } from "@/lib/navigation";
import { type ExchangeRateApiKey, useCurrency } from "@/hook/use-currency";
import useSwitchLocale from "@/hook/use-switch-locale";
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

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [localeOpen, setLocaleOpen] = useState<boolean>(false);
    const t = useTranslations();
    const switchLocale = useSwitchLocale();
    const locale = useLocale();
    const { setTheme } = useTheme();
    const { currency, setCurrency } = useCurrency();

    const toggleTheme = () => {
        setTheme((e) => (e === "dark" ? "light" : "dark"));
    };

    return (
        <>
            <div className="flex">
                <div
                    style={{
                        backgroundImage: `url('/images/creator.jpeg')`,
                        backgroundSize: "cover",
                    }}
                    className="h-screen w-1/2 relative max-lg:hidden"
                />
                <div className="relative w-full">
                    <div className="flex items-center justify-between z-50 absolute p-4 w-full">
                        <Link
                            href="/"
                            className="btn btn-sm btn-circle btn-outline"
                        >
                            <Home className="size-5" />
                        </Link>
                        <div className="space-x-2">
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
                    {children}
                </div>
            </div>
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

export default Layout;
