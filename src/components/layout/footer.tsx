"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { title } from "@/config/seo";
import { useGetFooterLinks } from "@/config/links";
import Logo from "../ui/logo";
import LogoText from "../ui/logo-text";

const Footer: React.FC = () => {
    const t = useTranslations();

    const footerLinks = useGetFooterLinks();

    return (
        <footer className="w-full max-w-8xl mx-auto my-10 space-y-8">
            <div className="w-full grid grid-cols-1 lg:grid-cols-3">
                <div className="w-full flex items-center justify-center gap-2">
                    <Logo className="h-14" />
                    <LogoText className="h-12" />
                </div>

                <div className="w-full flex flex-wrap items-center justify-center gap-x-6">
                    {footerLinks.map((link) => (
                        <Link
                            key={link.path}
                            href={link.path}
                            target="_blank"
                            rel="noreferrer"
                            className="link link-hover"
                        >
                            {link.title}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center justify-center">
                    {t("common.made-with")}
                </div>
            </div>

            <div className="w-full text-center text-lg text-neutral">
                &copy; {new Date().getFullYear()} {title}.{" "}
                {t("common.copyright")}.
            </div>
        </footer>
    );
};

export default Footer;

// <div className="w-full flex flex-col items-center justify-center">
//     <div className="flex items-center gap-4">
//         <Link href="https://www.facebook.com/" target="_blank">
//             <Image
//                 src="/images/icons/facebook.png"
//                 alt=""
//                 width={256}
//                 height={256}
//                 className="size-8"
//             />
//         </Link>
//         <Link href="https://www.instagram.com/" target="_blank">
//             <Image
//                 src="/images/icons/instagram.png"
//                 alt=""
//                 width={256}
//                 height={256}
//                 className="size-8"
//             />
//         </Link>
//         <Link href="https://www.tiktok.com/" target="_blank">
//             <Image
//                 src="/images/icons/tiktok.png"
//                 alt=""
//                 width={256}
//                 height={256}
//                 className="size-8"
//             />
//         </Link>
//     </div>
// </div>
