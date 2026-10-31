"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import type { User } from "lucia";
import {
    BookOpenText,
    ChevronDown,
    LogOut,
    Menu,
    Moon,
    Sun,
    UserIcon,
    X,
} from "lucide-react";
import { cn, requestAPI } from "@/lib/utils";
import { useGetLinks } from "@/config/links";
import useScroll from "@/hook/use-scroll";
import useOutsideClick from "@/hook/use-outside-click";
import Logo from "@/components/ui/logo";
import Avatar from "@/components/ui/avatar";
import LocaleModal from "@/components/ui/locale-modal";

type HeaderProps = {
    user: User | null;
    children: React.ReactNode;
};

const Header: React.FC<HeaderProps> = ({ user, children }) => {
    const t = useTranslations("links");
    const [localeOpen, setLocaleOpen] = useState<boolean>(false);
    const [sheetOpen, setSheetOpen] = useState<boolean>(false);
    const links = useGetLinks().filter((l) => l.path !== "/");
    const router = useRouter();
    const pathname = usePathname();
    const hasScrolled = useScroll(4);
    const locale = useLocale();
    const { resolvedTheme, setTheme } = useTheme();

    const handleLogout = async () => {
        await requestAPI("GET", "/api/auth/logout");
        router.refresh();
    };

    const toggleTheme = () => {
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
    };

    useEffect(() => {
        document.documentElement.style.overflow = sheetOpen ? "hidden" : "";
    }, [sheetOpen]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setSheetOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const flag = (
        <span className="font-display text-sm font-semibold uppercase">
            {locale}
        </span>
    );

    return (
        <>
            <header
                className={cn(
                    "sticky top-0 z-50 w-full bg-canvas border-b transition-colors",
                    hasScrolled || sheetOpen ? "border-hairline" : (
                        "border-transparent"
                    )
                )}
            >
                <div className="container-page flex h-16 items-center justify-between gap-4">
                    <div className="flex items-center gap-8 lg:gap-10">
                        <Link
                            href="/"
                            aria-label="Coolbooks"
                            onClick={() => setSheetOpen(false)}
                        >
                            <Logo withText />
                        </Link>

                        <nav className="hidden md:block">
                            <ul className="flex items-center gap-5 lg:gap-7">
                                {links.map((item) => (
                                    <li key={item.path}>
                                        <Link
                                            href={item.path}
                                            className="type-body text-ink whitespace-nowrap active:text-muted"
                                        >
                                            {item.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-3">
                        <button
                            className="button-icon hidden md:inline-flex"
                            onClick={() => setLocaleOpen(true)}
                            aria-label={t("language")}
                        >
                            {flag}
                        </button>

                        {user ?
                            <UserMenu
                                user={user}
                                onToggleTheme={toggleTheme}
                                onLogout={handleLogout}
                            />
                        :   <Link
                                href={`/login?redirect=${pathname}`}
                                className="hidden md:inline-flex type-body font-medium text-ink px-2 whitespace-nowrap"
                            >
                                {t("login")}
                            </Link>
                        }

                        <Link
                            href="/#create-book"
                            className="button-primary button-sm hidden lg:inline-flex"
                        >
                            {t("create-book")}
                        </Link>

                        <button
                            className="button-icon md:hidden"
                            onClick={() => setSheetOpen((o) => !o)}
                            aria-label="Menu"
                            aria-expanded={sheetOpen}
                        >
                            {sheetOpen ?
                                <X className="size-5" />
                            :   <Menu className="size-5" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile full-screen sheet */}
            <div
                className={cn(
                    "fixed inset-x-0 top-16 bottom-0 z-40 bg-canvas md:hidden overflow-y-auto transition-opacity duration-150",
                    sheetOpen ? "opacity-100" : "pointer-events-none opacity-0"
                )}
                aria-hidden={!sheetOpen}
            >
                <div className="container-page flex min-h-full flex-col pb-8">
                    <ul className="divide-y divide-hairline border-b border-hairline">
                        {links.map((item) => (
                            <li key={item.path}>
                                <Link
                                    href={item.path}
                                    onClick={() => setSheetOpen(false)}
                                    className="flex py-4 type-title-md text-ink"
                                >
                                    {item.title}
                                </Link>
                            </li>
                        ))}
                        {user && (
                            <>
                                <li>
                                    <Link
                                        href="/my-books"
                                        onClick={() => setSheetOpen(false)}
                                        className="flex py-4 type-title-md text-ink"
                                    >
                                        {t("my-books")}
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/account"
                                        onClick={() => setSheetOpen(false)}
                                        className="flex py-4 type-title-md text-ink"
                                    >
                                        {t("account")}
                                    </Link>
                                </li>
                            </>
                        )}
                    </ul>

                    <div className="flex flex-wrap gap-2 py-6">
                        <button
                            className="button-secondary button-sm"
                            onClick={() => {
                                setSheetOpen(false);
                                setLocaleOpen(true);
                            }}
                        >
                            {flag}
                            {t("language")}
                        </button>
                        <button
                            className="button-secondary button-sm"
                            onClick={toggleTheme}
                        >
                            <Moon className="size-4 dark:hidden" />
                            <Sun className="size-4 hidden dark:block" />
                            {t("theme")}
                        </button>
                        {user && (
                            <button
                                className="button-secondary button-sm"
                                onClick={handleLogout}
                            >
                                <LogOut className="size-4" />
                                {t("logout")}
                            </button>
                        )}
                    </div>

                    <div className="mt-auto flex flex-col gap-3">
                        <Link
                            href="/#create-book"
                            onClick={() => setSheetOpen(false)}
                            className="button-primary w-full"
                        >
                            {t("create-book")}
                        </Link>
                        {!user && (
                            <Link
                                href={`/login?redirect=${pathname}`}
                                onClick={() => setSheetOpen(false)}
                                className="button-secondary w-full"
                            >
                                {t("login")}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {children}

            <LocaleModal open={localeOpen} setOpen={setLocaleOpen} />
        </>
    );
};

type UserMenuProps = {
    user: User;
    onToggleTheme: () => void;
    onLogout: () => void;
};

const UserMenu: React.FC<UserMenuProps> = ({
    user,
    onToggleTheme,
    onLogout,
}) => {
    const t = useTranslations("links");
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const close = useCallback(() => setOpen(false), []);
    useOutsideClick(ref as React.RefObject<HTMLDivElement>, close);

    const item =
        "flex w-full items-center gap-3 rounded-sm px-3 py-2.5 type-body text-ink active:bg-surface-soft";

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-full p-0.5 pr-2 border border-hairline"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <Avatar userName={user.name} className="size-8 text-xs" />
                <ChevronDown className="size-4 text-muted" />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 top-full mt-2 w-64 rounded-md border border-hairline bg-canvas p-1.5 shadow-[0_8px_24px_rgb(24_29_38/0.08)]"
                >
                    <div className="px-3 pt-2 pb-3 border-b border-hairline mb-1.5">
                        <p className="type-label text-ink truncate">
                            {user.name}
                        </p>
                        <p className="type-body text-muted truncate">
                            {user.email}
                        </p>
                    </div>
                    <Link href="/account" className={item} onClick={close}>
                        <UserIcon className="size-4" />
                        {t("account")}
                    </Link>
                    <Link href="/my-books" className={item} onClick={close}>
                        <BookOpenText className="size-4" />
                        {t("my-books")}
                    </Link>
                    <button onClick={onToggleTheme} className={item}>
                        <Moon className="size-4 dark:hidden" />
                        <Sun className="size-4 hidden dark:block" />
                        {t("theme")}
                    </button>
                    <div className="my-1.5 h-px bg-hairline" />
                    <button onClick={onLogout} className={item}>
                        <LogOut className="size-4" />
                        {t("logout")}
                    </button>
                </div>
            )}
        </div>
    );
};

export default Header;
