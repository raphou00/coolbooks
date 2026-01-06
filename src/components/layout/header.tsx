"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import type { User } from "lucia";
import {
    BookOpenText,
    LogIn,
    LogOut,
    Menu,
    Moon,
    PenBox,
    Sparkles,
    Sun,
    UserIcon,
} from "lucide-react";
import { cn, requestAPI } from "@/lib/utils";
import { useGetLinks } from "@/config/links";
import useScroll from "@/hook/use-scroll";
import Logo from "@/components/ui/logo";
import Avatar from "@/components/ui/avatar";
import LocaleModal from "@/components/ui/locale-modal";
import LogoText from "@/components/ui/logo-text";

type HeaderProps = {
    user: User | null;
    children: React.ReactNode;
};

const Header: React.FC<HeaderProps> = ({ user, children }) => {
    const t = useTranslations("links");
    const [localeOpen, setLocaleOpen] = useState<boolean>(false);
    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
    const links = useGetLinks();
    const router = useRouter();
    const pathname = usePathname();
    const hasScrolled = useScroll(0);
    const locale = useLocale();
    const { setTheme } = useTheme();

    const handleLogout = async () => {
        await requestAPI("GET", "/api/auth/logout");
        router.refresh();
    };

    const toggleTheme = () => {
        setTheme((e) => (e === "dark" ? "light" : "dark"));
    };

    useEffect(() => {
        if (drawerOpen) {
            document.documentElement.style.overflow = "hidden";
        } else {
            document.documentElement.style.overflow = "auto";
        }
    }, [drawerOpen]);

    return (
        <>
            <div className="drawer">
                <input
                    id="drawer"
                    type="checkbox"
                    className="drawer-toggle"
                    onChange={(e) => setDrawerOpen(e.target.checked)}
                />
                <div className="drawer-content">
                    <header
                        className={cn(
                            "fixed top-0 z-90 w-full backdrop-blur-xl bg-base-100/30 transition-all",
                            hasScrolled ? "bg-base-100" : ""
                        )}
                    >
                        <div className="navbar min-h-14 py-0 mx-auto max-w-8xl w-full px-4 md:px-6 lg:px-8 xl:px-12">
                            <div className="navbar-start space-x-4">
                                <label
                                    htmlFor="drawer"
                                    role="button"
                                    className="items-center justify-center cursor-pointer hidden max-[800px]:flex"
                                >
                                    <Menu className="size-10 text-base-content/90" />
                                </label>
                                <Link
                                    href="/"
                                    className="flex items-center gap-x-2 text-sm relative z-20 transition focus:scale-95"
                                >
                                    <Logo className="h-10 w-min" />
                                </Link>
                            </div>
                            <div className="navbar-center">
                                <ul className="flex gap-x-8 max-[800px]:hidden">
                                    {links.map((item) => (
                                        <li key={item.title}>
                                            <Link
                                                href={item.path}
                                                className={cn(
                                                    "link no-underline",
                                                    item.path === pathname ?
                                                        ""
                                                    :   ""
                                                )}
                                            >
                                                <span className="">
                                                    {item.title}
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="navbar-end space-x-2">
                                <button
                                    className="btn btn-circle"
                                    onClick={() => setLocaleOpen((e) => !e)}
                                >
                                    <Image
                                        src={`/images/locales/${locale}.png`}
                                        alt={locale}
                                        width={32}
                                        height={32}
                                        className="size-6 rounded-field"
                                    />
                                </button>
                                <div className="dropdown dropdown-end dropdown-bottom dropdown-hover flex items-center h-10 z-100">
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        className="btn rounded-full cursor-pointer"
                                    >
                                        {user ?
                                            <>
                                                <Avatar
                                                    userName={user?.name}
                                                    className="size-8 p-2 -ml-3"
                                                />
                                                <span className="font-bold">
                                                    {t("profile")}
                                                </span>
                                            </>
                                        :   <>
                                                <span className="font-bold">
                                                    {t("get-started")}
                                                </span>
                                            </>
                                        }
                                    </div>
                                    <div
                                        tabIndex={0}
                                        className="dropdown-content pt-2.5 z-1"
                                    >
                                        <div className="relative rounded-field bg-base-100 p-2 border-2 border-neutral/20 shadow-xl w-72 max-[900px]:w-[calc(100vw-32px)] z-100">
                                            <span
                                                style={{
                                                    clipPath:
                                                        "polygon(0 0, 100% 0, 50% 50%, 0% 100%)",
                                                }}
                                                className="absolute right-0 top-0 h-4 w-4 -translate-x-9 -translate-y-[calc(50%)] rotate-45 rounded-tl border-2 border-neutral/20 bg-base-100"
                                            />
                                            {user ?
                                                <>
                                                    <a
                                                        href="/account"
                                                        className="btn btn-ghost rounded-field border-none m-0 my-px w-full justify-start"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <UserIcon className="size-6" />
                                                            {t("account")}
                                                        </span>
                                                    </a>

                                                    <a
                                                        href="/my-books"
                                                        className="btn btn-ghost rounded-field border-none m-0 my-px w-full justify-start"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <BookOpenText className="size-6" />
                                                            {t("my-books")}
                                                        </span>
                                                    </a>
                                                </>
                                            :   <>
                                                    <a
                                                        href="/#create-book"
                                                        className="btn rounded-field border-none m-0 my-px w-full justify-start text-white bg-linear-to-bl from-primary to-secondary"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <Sparkles className="size-6" />
                                                            {t(
                                                                "create-first-book"
                                                            )}
                                                        </span>
                                                    </a>

                                                    <a
                                                        href={`/login?redirect=${pathname}`}
                                                        className="btn btn-ghost rounded-field border-none m-0 my-px w-full justify-start"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <LogIn className="size-6" />
                                                            {t("login")}
                                                        </span>
                                                    </a>

                                                    <a
                                                        href={`/register?redirect=${pathname}`}
                                                        className="btn btn-ghost rounded-field border-none m-0 my-px w-full justify-start"
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            <PenBox className="size-6" />
                                                            {t("register")}
                                                        </span>
                                                    </a>
                                                </>
                                            }

                                            <div className="divider mx-auto my-px w-full px-3" />

                                            <button
                                                onClick={toggleTheme}
                                                className="btn btn-ghost rounded-field border-none m-0 my-px w-full justify-start"
                                            >
                                                <div className="swap swap-rotate dark:swap-active">
                                                    <Moon className="swap-on size-6" />
                                                    <Sun className="swap-off size-6" />
                                                </div>
                                                {t("theme")}
                                            </button>

                                            {user && (
                                                <>
                                                    <div className="divider mx-auto my-px w-full px-3" />

                                                    <button
                                                        onClick={handleLogout}
                                                        className="btn btn-ghost rounded-field border-none m-0 my-px w-full justify-start"
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
                <div className="drawer-side z-100">
                    <label
                        htmlFor="drawer"
                        aria-label="close sidebar"
                        className="drawer-overlay"
                    />
                    <ul className="menu bg-base-200 min-h-dvh w-80 space-y-3 p-4">
                        <a href="/" className="flex items-center mb-8">
                            <Logo className="h-14 w-min" />
                            <LogoText className="h-12 w-min" />
                        </a>
                        {links.map((item) => (
                            <li key={item.title}>
                                <a
                                    href={item.path}
                                    className={cn(
                                        "btn justify-between w-[288px]",
                                        pathname === item.path ?
                                            "btn-primary"
                                        :   ""
                                    )}
                                >
                                    <span className="flex items-center gap-2">
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
