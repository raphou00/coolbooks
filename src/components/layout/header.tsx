"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useTheme } from "next-themes";
import type { User } from "lucia";
import {
    BookMarked,
    Coins,
    DollarSign,
    LogIn,
    LogOut,
    Menu,
    PenBox,
    PhoneCall,
    UserIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn, requestAPI } from "@/lib/utils";
import { useGetLinks } from "@/config/links";
import LogoText from "@/components/ui/logo-text";
import Avatar from "@/components/ui/avatar";
import Title from "@/components/ui/title";
import LocaleModal from "@/components/ui/locale-modal";
import Search from "@/components/ui/search";

type HeaderProps = {
    user: User | null;
    children: React.ReactNode;
};

const Header: React.FC<HeaderProps> = ({ user, children }) => {
    const [localeOpen, setLocaleOpen] = useState<boolean>(false);
    const t = useTranslations("links");
    const links = useGetLinks(user);
    const router = useRouter();
    const pathname = usePathname();
    const { setTheme } = useTheme();

    const handleLogout = async () => {
        await requestAPI("GET", "/api/auth/logout");
        router.refresh();
    };

    const _toggleTheme = () => {
        setTheme((e) => (e === "dark" ? "light" : "dark"));
    };

    return (
        <>
            <div className="drawer">
                <input id="drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content">
                    {children}
                    <div className="fixed w-full top-0 z-100">
                        <div className="w-full bg-base-100">
                            <div className="navbar min-h-16 py-0 mx-auto transition max-w-8xl w-full px-4 md:px-6 lg:px-8 xl:px-12">
                                <div className="navbar-start">
                                    <label
                                        htmlFor="drawer"
                                        role="button"
                                        className="items-center justify-center cursor-pointer hidden max-[1200px]:flex"
                                    >
                                        <Menu className="size-11 text-base-content/90" />
                                    </label>
                                    <ul className="menu menu-horizontal space-x-2 max-[1200px]:hidden">
                                        {links.map((item) => (
                                            <li key={item.title}>
                                                <Link
                                                    href={item.path}
                                                    className={cn(
                                                        "btn text-white",
                                                        item.path === pathname ?
                                                            "btn-primary"
                                                        :   "bg-black/70"
                                                    )}
                                                >
                                                    <item.icon className="size-5" />
                                                    <span className="text-[16px]">
                                                        {item.title}
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="navbar-center">
                                    <Link
                                        href="/"
                                        className="flex items-center text-sm relative z-20 focus:scale-95"
                                    >
                                        <LogoText className="h-14 w-min" />
                                    </Link>
                                </div>
                                <div className="navbar-end space-x-2">
                                    <div className="w-full max-w-[300px] max-[1200px]:hidden">
                                        <Search />
                                    </div>

                                    <div className="dropdown dropdown-end dropdown-bottom dropdown-hover flex items-center size-12 z-100">
                                        <div
                                            role="button"
                                            tabIndex={0}
                                            className="flex items-center group cursor-pointer"
                                        >
                                            <Avatar
                                                userName={user?.name}
                                                className="size-11 p-3"
                                            />
                                        </div>
                                        <div
                                            tabIndex={0}
                                            className="dropdown-content pt-4 !z-[1]"
                                        >
                                            <div className="space-y-1 rounded-xl bg-base-100 p-2 border border-black/90 shadow-xl w-72 z-100">
                                                {user ?
                                                    <>
                                                        <div className="my-4 flex flex-col items-center justify-center gap-y-2">
                                                            <Title
                                                                text={user.name}
                                                                className="text-center font-bold"
                                                            />
                                                        </div>

                                                        <a
                                                            href="/account/profile"
                                                            className="btn btn-ghost rounded-xl border-none m-0 w-full justify-start"
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <UserIcon className="size-6" />
                                                                {t("account")}
                                                            </span>
                                                        </a>

                                                        <a
                                                            href="/favorites"
                                                            className="btn btn-ghost rounded-xl border-none m-0 w-full justify-start"
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <BookMarked className="size-6" />
                                                                {t("favorites")}
                                                            </span>
                                                        </a>

                                                        <a
                                                            href="/account/billing"
                                                            className="btn btn-ghost rounded-xl border-none m-0 w-full justify-between"
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <Coins className="size-6" />
                                                                {t("credits")}
                                                            </span>
                                                            <span
                                                                className={cn(
                                                                    "badge badge-secondary badge-xl rounded-full",
                                                                    (
                                                                        user?.credits >
                                                                            0
                                                                    ) ?
                                                                        "text-white"
                                                                    :   "text-red-300"
                                                                )}
                                                            >
                                                                {user?.credits}
                                                            </span>
                                                        </a>
                                                    </>
                                                :   <>
                                                        <a
                                                            href={`/login?redirect=${pathname}`}
                                                            className="btn btn-ghost rounded-xl border-none m-0 w-full justify-start"
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <LogIn className="size-6" />
                                                                {t("login")}
                                                            </span>
                                                        </a>

                                                        <a
                                                            href={`/register?redirect=${pathname}`}
                                                            className="btn btn-ghost rounded-xl border-none m-0 w-full justify-start"
                                                        >
                                                            <span className="flex items-center gap-2">
                                                                <PenBox className="size-6" />
                                                                {t("register")}
                                                            </span>
                                                        </a>
                                                    </>
                                                }

                                                <div className="divider mx-auto my-1 w-full px-2" />

                                                <a
                                                    href="/pricing"
                                                    className="btn btn-ghost rounded-xl border-none m-0 w-full justify-start"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <DollarSign className="size-6" />
                                                        {t("pricing")}
                                                    </span>
                                                </a>

                                                <a
                                                    href="/contact"
                                                    className="btn btn-ghost rounded-xl border-none m-0 w-full justify-start"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <PhoneCall className="size-6" />
                                                        {t("contact")}
                                                    </span>
                                                </a>

                                                {/* <button
                                                    onClick={() =>
                                                        setLocaleOpen((e) => !e)
                                                    }
                                                    className="btn btn-ghost rounded-xl border-none m-0 w-full justify-start"
                                                >
                                                    <span className="flex items-center gap-2">
                                                        <Languages className="size-6" />
                                                        {t("language")}
                                                    </span>
                                                </button> */}

                                                {user && (
                                                    <>
                                                        <div className="divider my-1 mx-auto w-full px-2" />

                                                        <button
                                                            onClick={
                                                                handleLogout
                                                            }
                                                            className="btn btn-ghost rounded-xl border-none m-0 w-full justify-start"
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
                    </div>
                </div>
                <div className="drawer-side z-[9999]">
                    <label
                        htmlFor="drawer"
                        aria-label="close sidebar"
                        className="drawer-overlay"
                    ></label>
                    <ul className="menu bg-base-200 min-h-dvh w-80 space-y-3 p-4 z-[99999999]">
                        <a
                            href="/"
                            className="ml-2 mt-4 mb-8 flex items-center text-sm relative z-20"
                        >
                            <LogoText className="h-14 w-min" />
                        </a>
                        <Search />
                        {links.map((item) => (
                            <li key={item.title}>
                                <a
                                    href={item.path}
                                    className="btn btn-lg justify-between w-[288px]"
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
