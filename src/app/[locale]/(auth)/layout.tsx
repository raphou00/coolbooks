"use client";

import Link from "next/link";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Logo from "@/components/ui/logo";
import Boo from "@/components/ui/boo";
import LocaleModal from "@/components/ui/locale-modal";

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
    const t = useTranslations("links");
    const tHome = useTranslations("pages.home");
    const [localeOpen, setLocaleOpen] = useState<boolean>(false);
    const locale = useLocale();

    return (
        <>
            <div className="flex min-h-dvh bg-canvas">
                <div className="relative flex w-full flex-col lg:w-1/2">
                    <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-12">
                        <Link href="/" aria-label={t("home")}>
                            <Logo withText />
                        </Link>
                        <button
                            onClick={() => setLocaleOpen(true)}
                            className="button-secondary button-sm"
                        >
                            <span className="uppercase">{locale}</span>
                            <span className="hidden sm:inline">
                                {t("language")}
                            </span>
                        </button>
                    </div>
                    {children}
                </div>

                <div className="hidden p-4 lg:block lg:w-1/2">
                    <div className="sticky top-4 flex h-[calc(100dvh-2rem)] flex-col justify-between overflow-hidden rounded-lg border-[2.5px] border-navy bg-sky p-12 text-navy shadow-[0_6px_0_#23264a]">
                        <div className="max-w-md">
                            <span className="inline-flex rounded-full border-2 border-navy bg-white px-3.5 py-1 font-display text-sm font-semibold shadow-[0_3px_0_#23264a]">
                                {tHome("hero.tag")}
                            </span>
                            <p className="type-display-md mt-6 text-balance">
                                {tHome.rich("hero.title", {
                                    hl: (chunks) => (
                                        <span className="text-white [text-shadow:0_3px_0_#23264a]">
                                            {chunks}
                                        </span>
                                    ),
                                })}
                            </p>
                        </div>
                        <div className="mx-auto w-full max-w-sm">
                            <Boo pose="read" title="Boo" />
                        </div>
                    </div>
                </div>
            </div>

            <LocaleModal open={localeOpen} setOpen={setLocaleOpen} />
        </>
    );
};

export default Layout;
