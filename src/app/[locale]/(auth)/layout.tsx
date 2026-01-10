"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Home } from "lucide-react";
import LocaleModal from "@/components/ui/locale-modal";

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
    const t = useTranslations("links");
    const [localeOpen, setLocaleOpen] = useState<boolean>(false);
    const locale = useLocale();

    return (
        <>
            <div className="flex">
                <div
                    style={{
                        backgroundImage: "url('/images/auth.png')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                    className="h-screen w-full max-w-lg relative max-lg:hidden border-r border-neutral/20"
                />
                <div className="relative w-full">
                    <div className="flex items-center justify-between z-50 absolute p-2 w-full">
                        <Link href="/" className="btn max-sm:btn-circle">
                            <Home className="size-5" />
                            <span className="hidden sm:block">{t("home")}</span>
                        </Link>
                        <button
                            onClick={() => setLocaleOpen((e) => !e)}
                            className="btn max-sm:btn-circle"
                        >
                            <Image
                                src={`/images/locales/${locale}.png`}
                                alt={locale}
                                width={32}
                                height={32}
                                className="size-6 rounded-field"
                            />
                            <span className="hidden sm:block">
                                {t("language")}
                            </span>
                        </button>
                    </div>
                    {children}
                </div>
            </div>

            <LocaleModal open={localeOpen} setOpen={setLocaleOpen} />
        </>
    );
};

export default Layout;
