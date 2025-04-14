"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Home, Languages, SunMoon } from "lucide-react";
import { Link } from "@/lib/navigation";
import LocaleModal from "@/components/ui/locale-modal";
import Image from "@/components/ui/image";

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
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
                    alt="Girl"
                    width={256}
                    height={256}
                    className="absolute top-0 left-0 m-2 h-10 w-auto z-50"
                />
                <div
                    style={{
                        backgroundImage: `url('/images/girl.jpeg')`,
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

            <LocaleModal open={localeOpen} setOpen={setLocaleOpen} />
        </>
    );
};

export default Layout;
