"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { title } from "@/config/seo";
import { useGetFooterLinks, useGetLinks } from "@/config/links";
import Logo from "@/components/ui/logo";

const Footer: React.FC = () => {
    const t = useTranslations();
    const { resolvedTheme, setTheme } = useTheme();
    const productLinks = useGetLinks().filter((l) => l.path !== "/");
    const legalLinks = useGetFooterLinks();

    const columns = [
        { title: t("links.product"), links: productLinks },
        {
            title: t("links.account"),
            links: [
                { title: t("links.login"), path: "/login" },
                { title: t("links.register"), path: "/register" },
                { title: t("links.my-books"), path: "/my-books" },
            ],
        },
        { title: t("links.legal"), links: legalLinks },
    ];

    return (
        <footer className="bg-canvas">
            <div className="container-page pt-16 md:pt-24 pb-10">
                <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-12">
                    <div className="col-span-2 md:col-span-5 flex flex-col gap-4 max-w-sm">
                        <Link href="/" aria-label={title} className="w-fit">
                            <Logo withText />
                        </Link>
                        <p className="type-body text-muted">
                            {t("common.description")}
                        </p>
                    </div>

                    {columns.map((col) => (
                        <div
                            key={col.title}
                            className="md:col-span-2 lg:col-span-2"
                        >
                            <h3 className="type-caption text-ink mb-4">
                                {col.title}
                            </h3>
                            <ul className="flex flex-col gap-3">
                                {col.links.map((link) => (
                                    <li key={link.path}>
                                        <Link
                                            href={link.path}
                                            className="type-body text-muted active:text-ink"
                                        >
                                            {link.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-16 flex flex-col-reverse gap-4 border-t border-hairline pt-6 md:flex-row md:items-center md:justify-between">
                    <p className="type-body text-muted">
                        &copy; {new Date().getFullYear()} {title}.{" "}
                        {t("common.copyright")}.
                    </p>
                    <div className="flex items-center gap-4">
                        <span className="type-body text-muted">
                            {t("common.made-with")}
                        </span>
                        <button
                            onClick={() =>
                                setTheme(
                                    resolvedTheme === "dark" ? "light" : "dark"
                                )
                            }
                            className="button-icon size-9!"
                            aria-label={t("links.theme")}
                        >
                            <Moon className="size-4 dark:hidden" />
                            <Sun className="size-4 hidden dark:block" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
