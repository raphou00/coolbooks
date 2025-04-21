"use client";

import { type User } from "lucia";
import { Link, usePathname } from "@/lib/navigation";
import { useGetAccountLinks } from "@/config/links";
import { cn } from "@/lib/utils";
import Avatar from "@/components/ui/avatar";
import Title from "@/components/ui/title";

type AccoutProps = {
    user: User;
    children: React.ReactNode;
};

export const AccoutMenu: React.FC<AccoutProps> = ({ user, children }) => {
    const pathname = usePathname();
    const accountLinks = useGetAccountLinks();

    return (
        <div className="mx-auto mt-12 max-w-4xl space-y-4">
            <div className="flex justify-between w-full">
                <div className="flex gap-x-4">
                    <Avatar src={null} alt={user.name} className="size-14" />

                    <div className="flex flex-col">
                        <Title text={user.name} />
                    </div>
                    <span className="text-lg mt-0.5 text-gray-500">/</span>
                    <Title
                        text={
                            accountLinks.find((link) => link.path === pathname)
                                ?.title ?? ""
                        }
                        className="text-2xl w-fit"
                    />
                </div>
            </div>

            <div className="flex items-start gap-y-2">
                <div className="mt-5 flex w-full max-w-56 flex-col justify-center gap-x-2">
                    {accountLinks.map((link) => (
                        <Link
                            key={link.path}
                            href={link.path}
                            className={cn(
                                "link h-8 no-underline last:mt-1 last:text-error hover:underline ",
                                link.path === pathname ?
                                    "font-bold underline"
                                :   "font-normal"
                            )}
                        >
                            {link.title}
                        </Link>
                    ))}
                </div>

                <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center">
                    {children}
                </div>
            </div>
        </div>
    );
};
