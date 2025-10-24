"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import type { User } from "lucia";
import axios from "axios";
import {
    Coins,
    Languages,
    LogIn,
    LogOut,
    PenBox,
    Settings2,
    UserIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useGetLinks } from "@/config/links";
import useScroll from "@/hook/use-scroll";
import Logo from "@/components/ui/logo";
import Avatar from "@/components/ui/avatar";
import Title from "@/components/ui/title";
import LocaleModal from "@/components/ui/locale-modal";

type HeaderProps = {
    user: User | null;
    children: React.ReactNode;
};

const Header: React.FC<HeaderProps> = ({ user, children }) => {
    const [localeOpen, setLocaleOpen] = useState<boolean>(false);
    const t = useTranslations("links");
    const links = useGetLinks();
    const router = useRouter();
    const pathname = usePathname();
    const scroll = useScroll(0);
    const { setTheme } = useTheme();

    const handleLogout = async () => {
        await axios.post("/api/auth/logout");
        router.refresh();
    };

    const _toggleTheme = () => {
        setTheme((e) => (e === "dark" ? "light" : "dark"));
    };

    return (
        <>
            <div className="drawer">
                <input
                    id="my-drawer-3"
                    type="checkbox"
                    className="drawer-toggle"
                />
                <div className="drawer-content flex flex-col">
                    <header className="fixed w-full top-0 z-60">
                        <div
                            className={cn(
                                "w-full",
                                (scroll || pathname == "/") &&
                                    "backdrop-blur bg-base-100/10"
                            )}
                        >
                            <div className="navbar min-h-14 py-0 mx-auto transition max-w-7xl w-full px-4 md:px-6 lg:px-8 xl:px-12">
                                <div className="navbar-start">
                                    <label
                                        htmlFor="my-drawer-3"
                                        role="button"
                                        className="flex items-center justify-center cursor-pointer"
                                    >
                                        <div className="size-10 relative min-[850px]:hidden">
                                            <motion.span
                                                className="absolute h-1 w-8 bg-base-content"
                                                style={{
                                                    y: "-50%",
                                                    left: "50%",
                                                    x: "-50%",
                                                    top: "30%",
                                                }}
                                            />
                                            <motion.span
                                                className="absolute h-1 w-8 bg-base-content"
                                                style={{
                                                    left: "50%",
                                                    x: "-50%",
                                                    top: "50%",
                                                    y: "-50%",
                                                }}
                                            />
                                            <motion.span
                                                className="absolute h-1 w-4 bg-base-content"
                                                style={{
                                                    x: "-50%",
                                                    y: "50%",
                                                    bottom: "30%",
                                                    left: "calc(50% - 8px)",
                                                }}
                                            />
                                        </div>
                                    </label>
                                    <div className="flex items-center ml-2 mr-3">
                                        <Link
                                            href="/"
                                            className="flex items-center text-sm relative z-20 focus:scale-95"
                                        >
                                            <Logo className="size-10" />
                                        </Link>
                                    </div>
                                    <ul className="menu menu-horizontal space-x-2 max-[850px]:hidden">
                                        {links.map((item) => (
                                            <li key={item.title}>
                                                <Link
                                                    href={item.path}
                                                    className={cn(
                                                        "btn btn-sm bg-base-content/80 text-white border-none",
                                                        item.path === pathname ?
                                                            "invert"
                                                        :   ""
                                                    )}
                                                >
                                                    <item.icon className="size-5" />
                                                    {item.title}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="navbar-end space-x-2">
                                    <Link
                                        href="/pricing"
                                        className="bg-black/70 no-underline group cursor-pointer relative shadow-2xl shadow-zinc-900 rounded-full p-px font-semibold leading-6 inline-block"
                                    >
                                        <span className="absolute inset-0 overflow-hidden rounded-full">
                                            <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,rgba(251,191,36,0.6)_0%,rgba(251,191,36,0)_75%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                                        </span>
                                        <div className="relative flex space-x-2 items-center z-10 rounded-full py-2 px-4 ring-1 ring-white/10 text-white">
                                            <Coins className="size-5 text-yellow-300" />
                                            {user ?
                                                <span
                                                    className={cn(
                                                        user?.credits > 0 ?
                                                            ""
                                                        :   "text-red-300"
                                                    )}
                                                >
                                                    {user?.credits}
                                                </span>
                                            :   <span>{t("pricing")}</span>}
                                        </div>
                                        <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-yellow-400/0 via-yellow-400/90 to-yellow-400/0 transition-opacity duration-500 group-hover:opacity-40" />
                                    </Link>

                                    <div className="dropdown dropdown-end dropdown-bottom dropdown-hover flex items-center size-12 z-100">
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            className="flex items-center group cursor-pointer"
                                        >
                                            {user ?
                                                <Avatar
                                                    src={null}
                                                    alt={user.name}
                                                    className="size-11"
                                                />
                                            :   <div className="btn btn-circle size-11 border-none bg-base-content/80">
                                                    <UserIcon className="size-6 text-white" />
                                                </div>
                                            }
                                        </div>
                                        <div
                                            tabIndex={0}
                                            className="dropdown-content pt-2 !z-[1]"
                                        >
                                            <div className="space-y-1 rounded-xl backdrop-blur-2xl bg-black/90 p-2 border border-black/90 shadow-xl w-72 z-100">
                                                {user ?
                                                    <>
                                                        <div className="my-2 flex flex-col items-center justify-center gap-y-2">
                                                            <Avatar
                                                                src={null}
                                                                alt={user.name}
                                                                className="size-16"
                                                            />
                                                            <Title
                                                                text={user.name}
                                                                className="text-center font-bold"
                                                            />
                                                        </div>

                                                        <a
                                                            href="/account/profile"
                                                            className="btn btn-ghost rounded-lg m-0 w-full justify-start"
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <Settings2 className="size-6" />
                                                                {t("account")}
                                                            </span>
                                                        </a>
                                                    </>
                                                :   <>
                                                        <a
                                                            href={`/login?redirect=${pathname}`}
                                                            className="btn btn-ghost rounded-lg m-0 w-full justify-start"
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <LogIn className="size-6" />
                                                                {t("login")}
                                                            </span>
                                                        </a>

                                                        <a
                                                            href={`/register?redirect=${pathname}`}
                                                            className="btn btn-ghost rounded-lg m-0 w-full justify-start"
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <PenBox className="size-6" />
                                                                {t("register")}
                                                            </span>
                                                        </a>
                                                    </>
                                                }

                                                <div className="divider mx-auto my-1 w-full px-2" />

                                                <button
                                                    onClick={() =>
                                                        setLocaleOpen((e) => !e)
                                                    }
                                                    className="btn btn-ghost rounded-lg m-0 w-full justify-start"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <Languages className="size-6" />
                                                        {t("language")}
                                                    </span>
                                                </button>

                                                {user && (
                                                    <>
                                                        <div className="divider my-1 mx-auto w-full px-2" />

                                                        <button
                                                            onClick={
                                                                handleLogout
                                                            }
                                                            className="btn btn-ghost rounded-lg m-0 w-full justify-start"
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <LogOut className="size-6" />
                                                                {t("logout")}
                                                            </span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {children}
                </div>
                <div className="drawer-side z-[9999]">
                    <label
                        htmlFor="my-drawer-3"
                        aria-label="close sidebar"
                        className="drawer-overlay"
                    ></label>
                    <ul className="menu bg-base-200 min-h-full w-80 space-y-3 p-4 z-[99999999]">
                        <Link
                            href="/"
                            className="ml-2 mb-4 flex items-center text-sm relative z-20"
                        >
                            <Logo className="h-16 w-auto ml-2 mb-2" />
                        </Link>
                        {links.map((item) => (
                            <li key={item.title}>
                                <a
                                    href={item.path}
                                    className="btn btn-ghost btn-lg w-full justify-between"
                                >
                                    <span className="flex items-center gap-2">
                                        <item.icon className="size-6" />
                                        {item.title}
                                    </span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <LocaleModal open={localeOpen} setOpen={setLocaleOpen} />
        </>
    );
};

export default Header;
