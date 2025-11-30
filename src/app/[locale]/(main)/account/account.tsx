"use client";

import { type User } from "lucia";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useGetAccountLinks } from "@/config/links";
import { cn } from "@/lib/utils";
import Avatar from "@/components/ui/avatar";
import Title from "@/components/ui/title";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type AccoutProps = {
    user: User;
    children: React.ReactNode;
};

export const AccoutMenu: React.FC<AccoutProps> = ({ user, children }) => {
    const pathname = usePathname();
    const accountLinks = useGetAccountLinks();
    const router = useRouter();

    return (
        <div className="mx-auto mt-12 max-w-4xl space-y-4">
            <div className="flex flex-col w-full">
                <div className="flex items-center gap-x-4">
                    <Avatar userName={user.name} className="size-14 p-3" />

                    <div className="flex flex-col">
                        <Title
                            text={
                                accountLinks.find(
                                    (link) => link.path === pathname
                                )?.title ?? ""
                            }
                            className="text-2xl w-fit"
                        />
                        <p className="text-sm text-base-content/80">
                            {user.name}
                        </p>
                    </div>
                </div>

                <div className="w-full hidden max-md:block my-4">
                    <Select
                        defaultValue={pathname ?? ""}
                        value={pathname ?? ""}
                        onValueChange={(l) => router.push(l)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder={pathname} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {accountLinks.map((l) => (
                                    <SelectItem key={l.path} value={l.path}>
                                        <div className="flex items-center gap-2">
                                            {l.title}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-start gap-y-2">
                <div className="mt-5 flex w-full max-w-56 flex-col justify-center gap-x-2 max-md:hidden">
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
