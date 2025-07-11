"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import type { User } from "lucia";
import axios from "axios";
import {
    DollarSign,
    Languages,
    LogIn,
    LogOut,
    PenBox,
    Search,
    Settings2,
    SunMoon,
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
import LogoText from "../ui/logo-text";

type HeaderProps = {
    user: User | null;
    children: React.ReactNode;
};

const Header: React.FC<HeaderProps> = ({ user, children }) => {
    const [localeOpen, setLocaleOpen] = useState<boolean>(false);
    const [search, setSearch] = useState<string>("");
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

    const toggleTheme = () => {
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
                    <header className="sticky w-full top-0 z-[999]">
                        <div
                            className={cn(
                                "navbar mx-auto bg-base-100 transition backdrop-blur-3xl max-w-7xl w-full px-4 md:px-6 lg:px-8 xl:px-12",
                                scroll && "yo"
                            )}
                        >
                            <div className="navbar-start">
                                <label
                                    htmlFor="my-drawer-3"
                                    role="button"
                                    className="flex items-center justify-center cursor-pointer"
                                >
                                    <div className="size-10 relative min-sm:hidden">
                                        <motion.span
                                            className="absolute h-1 w-8 rounded-full bg-base-content"
                                            style={{
                                                y: "-50%",
                                                left: "50%",
                                                x: "-50%",
                                                top: "30%",
                                            }}
                                        />
                                        <motion.span
                                            className="absolute h-1 w-8 rounded-full bg-base-content"
                                            style={{
                                                left: "50%",
                                                x: "-50%",
                                                top: "50%",
                                                y: "-50%",
                                            }}
                                        />
                                        <motion.span
                                            className="absolute h-1 w-4 rounded-full bg-base-content"
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
                                        className="flex items-center text-sm relative z-20"
                                    >
                                        <LogoText className="h-8 w-auto mb-2 max-md:hidden" />
                                        <Logo className="size-10 hidden max-md:block" />
                                    </Link>
                                </div>
                                <ul className="menu menu-horizontal space-x-2 max-sm:hidden">
                                    {links.map((item) => (
                                        <li key={item.title}>
                                            <Link
                                                href={item.path}
                                                className={cn(
                                                    "btn btn-sm indicator",
                                                    item.path === pathname ?
                                                        "btn-accent"
                                                    :   "btn-ghost btn-outline"
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
                                <div className="w-full max-w-80 hidden lg:block">
                                    <div className="relative w-full">
                                        <input
                                            type="text"
                                            className="input input-bordered w-full border-2 bg-base-100 tracking-wide transition placeholder:text-neutral-400 focus:border-neutral focus:outline-none focus:bg-base-300 pl-4 pr-9"
                                            placeholder={t(
                                                "search-placeholder"
                                            )}
                                            spellCheck={false}
                                            autoComplete="off"
                                            autoCapitalize="off"
                                            autoCorrect="off"
                                            value={search}
                                            onChange={(e) =>
                                                setSearch(e.target.value)
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    router.push(
                                                        `/explore?q=${search}`
                                                    );
                                                }
                                            }}
                                        />
                                        <button
                                            className="cursor-pointer z-20 size-7 bg-secondary rounded-full flex items-center justify-center absolute right-0 top-1/2 mx-1.5 -translate-y-1/2"
                                            onClick={() =>
                                                router.push(
                                                    `/explore?q=${search}`
                                                )
                                            }
                                        >
                                            <Search className="size-4 text-white" />
                                        </button>
                                    </div>
                                </div>
                                <Link
                                    href="/pricing"
                                    className="btn max-md:btn-circle bg-neutral/10"
                                >
                                    <DollarSign className="size-5" />
                                    <span className="hidden md:inline bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                        {t("pricing")}
                                    </span>
                                </Link>

                                <div className="dropdown dropdown-end dropdown-bottom dropdown-hover flex items-center size-12  z-[100]">
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        className="flex items-center group cursor-pointer"
                                    >
                                        {user ?
                                            <Avatar
                                                src={null}
                                                alt={user.name}
                                                className="size-11 lg:size-12"
                                            />
                                        :   <div className="btn btn-circle bg-neutral/10">
                                                <UserIcon className="size-6" />
                                            </div>
                                        }
                                    </div>
                                    <div
                                        tabIndex={0}
                                        className="dropdown-content pt-2 !z-[1]"
                                    >
                                        <div className="space-y-1 rounded-xl bg-base-200 p-2 border border-neutral/20 shadow-xl w-72 z-[2]">
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
                                                onClick={toggleTheme}
                                                className="btn btn-ghost rounded-lg m-0 w-full justify-start"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <SunMoon className="size-6" />
                                                    {t("theme")}
                                                </span>
                                            </button>

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
                                                        onClick={handleLogout}
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
                    </header>

                    {children}
                </div>
                <div className="drawer-side z-50">
                    <label
                        htmlFor="my-drawer-3"
                        aria-label="close sidebar"
                        className="drawer-overlay"
                    ></label>
                    <ul className="menu bg-base-200 min-h-full w-80 space-y-2 p-4">
                        <Link
                            href="/"
                            className="ml-2 flex items-center text-sm relative z-20"
                        >
                            <LogoText className="h-8 w-auto ml-2 mb-2" />
                        </Link>
                        {links.map((item) => (
                            <li key={item.title}>
                                <Link
                                    href={item.path}
                                    className="btn btn-ghost w-full justify-between"
                                >
                                    <span className="flex items-center gap-2">
                                        <item.icon className="size-6" />
                                        {item.title}
                                    </span>
                                </Link>
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
