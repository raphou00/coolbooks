"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useTheme } from "next-themes";
import { Home, Languages, SunMoon } from "lucide-react";
import { Link } from "@/lib/navigation";
import LocaleModal from "@/components/ui/locale-modal";

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
    const t = useTranslations("links");
    const [localeOpen, setLocaleOpen] = useState<boolean>(false);
    const { setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme((e) => (e === "dark" ? "light" : "dark"));
    };

    return (
        <>
            <div className="flex">
                <Image
                    src="/pinksea.svg"
                    alt="pinksea"
                    className="absolute z-50 w-auto h-10 m-0.5 max-lg:hidden"
                    width={100}
                    height={100}
                />
                <div
                    style={{
                        backgroundImage: `url('/images/photo.png')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                    className="h-screen w-1/2 relative max-lg:hidden"
                />
                <div className="relative w-full">
                    <div className="flex items-center justify-between z-50 absolute p-2 w-full">
                        <Link
                            href="/"
                            className="btn btn-sm max-sm:btn-circle btn-outline"
                        >
                            <Home className="size-5" />
                            <span className="hidden sm:block">{t("home")}</span>
                        </Link>
                        <div className="space-x-2">
                            <button
                                onClick={toggleTheme}
                                className="btn max-sm:btn-circle btn-outline btn-sm"
                            >
                                <SunMoon className="size-5" />
                                <span className="hidden sm:block">
                                    {t("theme")}
                                </span>
                            </button>

                            <button
                                onClick={() => setLocaleOpen((e) => !e)}
                                className="btn max-sm:btn-circle btn-outline btn-sm"
                            >
                                <Languages className="size-5" />
                                <span className="hidden sm:block">
                                    {t("language")}
                                </span>
                            </button>
                        </div>
                    </div>
                    {children}
                </div>
            </div>

            <LocaleModal open={localeOpen} setOpen={setLocaleOpen} />
        </>
    );
};

export default Layout;
