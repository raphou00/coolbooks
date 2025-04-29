"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import type { User } from "lucia";
import axios from "axios";
import {
    Languages,
    LogIn,
    LogOut,
    PenBox,
    Search,
    Settings2,
    SunMoon,
    UserIcon,
    SearchIcon,
    X,
    Home,
    MapPin,
    Heart,
    ImageIcon,
} from "lucide-react";
import { Link, usePathname, useRouter } from "@/lib/navigation";
import { cn, formatAmountForDisplay } from "@/lib/utils";
import { useGetLinks } from "@/config/links";
import useScroll from "@/hook/use-scroll";
import Image from "@/components/ui/image";
import Logo from "@/components/ui/logo";
import LogoText from "@/components/ui/logo-text";
import Avatar from "@/components/ui/avatar";
import Title from "@/components/ui/title";
import Modal from "@/components/ui/modal";
import LocaleModal from "@/components//ui/locale-modal";
import type { GirlWithMedia } from "@/components//ui/girls";
import NoResults from "../ui/no-results";

type HeaderProps = {
    user?: User | null;
    children: React.ReactNode;
};

const Header: React.FC<HeaderProps> = ({ user, children }) => {
    const [localeOpen, setLocaleOpen] = useState<boolean>(false);
    const [searchOpen, setSearchOpen] = useState<boolean>(false);
    const [search, setSearch] = useState("");
    const [girls, setGirls] = useState<GirlWithMedia[]>([]);
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

    const handleSearch = async () => {
        const res = await axios.get(`/api/search?q=${search}`);
        setGirls(res.data.girls);
    };

    const toggleTheme = () => {
        setTheme((e) => (e === "dark" ? "light" : "dark"));
    };

    useEffect(() => {
        handleSearch();
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <header className="sticky w-full top-0 z-50">
                <div
                    className={cn(
                        "navbar mx-auto px-2 md:px-4 bg-base-100 transition backdrop-blur-3xl",
                        scroll && ""
                    )}
                >
                    <div className="navbar-start">
                        <div className="dropdown dropdown-bottom dropdown-hover">
                            <div
                                tabIndex={0}
                                role="button"
                                className="flex items-center justify-center"
                            >
                                <div className="btn btn-circle btn-ghost relative min-[900px]:hidden">
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
                            </div>
                            <div tabIndex={0} className="dropdown-content pt-2">
                                <div className="w-[calc(100vw-20px)] space-y-1 rounded-xl bg-base-100 p-2 shadow-xl md:w-72">
                                    {links.map((item) => (
                                        <Link
                                            key={item.title}
                                            href={item.path}
                                            className="btn btn-ghost h-10 min-h-10 w-full justify-start"
                                        >
                                            <span className="flex items-center gap-2">
                                                <item.icon className="size-6" />
                                                {item.title}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center mr-4">
                            <Link
                                href="/"
                                className="flex space-x-2 items-center text-sm relative z-20"
                            >
                                <LogoText className="h-8 w-auto ml-2 mb-2 max-sm:hidden" />
                                <Logo className="size-12 sm:hidden" />
                            </Link>
                        </div>
                        <ul className="menu menu-horizontal space-x-2 max-[900px]:hidden">
                            {links.map((item) => (
                                <li key={item.title}>
                                    <Link
                                        href={item.path}
                                        className={cn(
                                            "btn btn-sm",
                                            item.path === pathname ?
                                                "btn-secondary"
                                            :   "btn-outline"
                                        )}
                                    >
                                        {item.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="navbar-end space-x-2">
                        <div className="relative max-w-96 w-full hidden lg:block">
                            <button
                                onClick={() => setSearchOpen(true)}
                                className="input text-left rounded-full w-full border-2 border-neutral/20 text-neutral bg-base-100 pr-9 tracking-wide"
                            >
                                {t("search-girl")}
                                <div className="size-9 bg-secondary rounded-full flex items-center justify-center absolute right-0 top-1/2 mx-1.5 -translate-y-1/2">
                                    <Search className="size-5 text-white" />
                                </div>
                            </button>
                        </div>

                        <button
                            className="btn btn-circle bg-neutral/10 lg:hidden"
                            onClick={() => setSearchOpen(true)}
                        >
                            <Search className="size-5" />
                        </button>

                        <div className="dropdown dropdown-end dropdown-bottom dropdown-hover flex items-center size-12">
                            <div
                                tabIndex={0}
                                role="button"
                                className="flex items-center"
                            >
                                {user ?
                                    <Avatar
                                        src={null}
                                        alt={user.name}
                                        className="size-11 lg:size-12"
                                    />
                                :   <button className="btn btn-circle bg-neutral/10">
                                        <UserIcon className="size-6" />
                                    </button>
                                }
                            </div>
                            <div tabIndex={0} className="dropdown-content pt-2">
                                <div className="w-[calc(100vw-16px)] space-y-1 rounded-xl bg-base-100 p-2 shadow-xl md:w-72">
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

                                            <Link
                                                href="/"
                                                className="btn btn-ghost h-10 min-h-10 w-full justify-start"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Home className="size-6" />
                                                    {t("home")}
                                                </span>
                                            </Link>

                                            <Link
                                                href="/account/profile"
                                                className="btn btn-ghost h-10 min-h-10 w-full justify-start"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Settings2 className="size-6" />
                                                    {t("account")}
                                                </span>
                                            </Link>
                                        </>
                                    :   <>
                                            <Link
                                                href="/"
                                                className="btn btn-ghost h-10 min-h-10 w-full justify-start"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <Home className="size-6" />
                                                    {t("home")}
                                                </span>
                                            </Link>

                                            <Link
                                                href="/login"
                                                className="btn btn-ghost h-10 min-h-10 w-full justify-start"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <LogIn className="size-6" />
                                                    {t("login")}
                                                </span>
                                            </Link>

                                            <Link
                                                href="/register"
                                                className="btn btn-ghost h-10 min-h-10 w-full justify-start"
                                            >
                                                <span className="flex items-center gap-2">
                                                    <PenBox className="size-6" />
                                                    {t("register")}
                                                </span>
                                            </Link>
                                        </>
                                    }

                                    <div className="divider mx-auto w-full px-2" />

                                    <button
                                        onClick={toggleTheme}
                                        className="btn btn-ghost h-10 min-h-10 w-full justify-start"
                                    >
                                        <span className="flex items-center gap-2">
                                            <SunMoon className="size-6" />
                                            {t("theme")}
                                        </span>
                                    </button>

                                    <button
                                        onClick={() => setLocaleOpen((e) => !e)}
                                        className="btn btn-ghost h-10 min-h-10 w-full justify-start"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Languages className="size-6" />
                                            {t("language")}
                                        </span>
                                    </button>

                                    {user && (
                                        <>
                                            <div className="divider mx-auto w-full px-2" />

                                            <button
                                                onClick={handleLogout}
                                                className="btn btn-ghost h-10 min-h-10 w-full justify-start"
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

            <LocaleModal open={localeOpen} setOpen={setLocaleOpen} />

            <Modal
                isOpen={searchOpen}
                setIsOpen={setSearchOpen}
                className="z-100 w-full p-0 max-h-screen m-1 overflow-y-auto"
            >
                <div className="flex flex-col items-center w-full">
                    <div className="relative w-full">
                        <input
                            type="text"
                            placeholder={t("search-girl")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-16 rounded-tl-xl rounded-tr-xl py-4 px-14 text-lg tracking-wide border-b border-neutral/20 transition placeholder:text-neutral-400 focus:outline-none focus:bg-base-300"
                            spellCheck={false}
                            autoComplete="off"
                            autoCapitalize="off"
                            autoCorrect="off"
                            onKeyUp={handleSearch}
                        />
                        <SearchIcon className="absolute top-5 left-5 text-neutral" />
                        <button
                            className="absolute top-4 right-5 btn btn-square btn-sm btn-ghost rounded-md transition"
                            onClick={() => setSearchOpen(false)}
                        >
                            <X className="size-6" />
                        </button>
                    </div>
                    <div className="flex flex-col gap-y-2 w-full h-full overflow-y-auto p-4">
                        {girls.length === 0 && <NoResults />}
                        {girls.map((girl) => {
                            const totalMediaCount = girl.medias
                                .map((e) => e.images.length + e.videos.length)
                                .reduce((a, b) => a + b, 0);
                            return (
                                <Link
                                    key={girl.id}
                                    href={`/${girl.username}`}
                                    onClick={() => setSearchOpen(false)}
                                    className="flex justify-between w-full rounded-lg hover:bg-base-200 p-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="relative w-14 h-14 mask mask-squircle">
                                            <Image
                                                src={girl.avatar}
                                                alt="avatar"
                                                width={256}
                                                height={256}
                                                className="size-full rounded-lg"
                                            />
                                        </div>
                                        <div className="h-full flex flex-col">
                                            <div className="text-lg font-bold">
                                                {girl.name}
                                            </div>
                                            <div className="text-sm opacity-50 flex gap-x-1 items-center">
                                                <div className="flex items-center gap-x-2">
                                                    <div className="flex items-center gap-x-1 w-fit">
                                                        <MapPin className="size-4" />
                                                        {girl.origin}
                                                    </div>
                                                    <div className="flex items-center gap-x-1 w-fit">
                                                        <Heart className="size-4" />
                                                        {girl.likes}
                                                    </div>
                                                    <div className="flex items-center gap-x-1 w-fit">
                                                        <ImageIcon className="size-4" />
                                                        {totalMediaCount}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mr-2">
                                        <div className="font-bold text-lg text-neutral">
                                            {formatAmountForDisplay(
                                                girl!.price
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default Header;
