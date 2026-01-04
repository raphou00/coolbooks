"use client";

import { useTranslations } from "next-intl";
import type { User } from "lucia";
import Title from "@/components/ui/title";
import Avatar from "@/components/ui/avatar";

type AccountProps = {
    user: User;
};

const Account: React.FC<AccountProps> = ({ user }) => {
    const t = useTranslations("pages.account");

    return (
        <div className="mx-auto my-6 space-y-4">
            <div className="flex flex-col w-full">
                <div className="flex items-center gap-x-4">
                    <Avatar userName={user.name} className="size-14" />

                    <div className="flex flex-col">
                        <Title text={t("title")} className="text-3xl w-fit" />
                        <p className="text-sm text-base-content/80">
                            {t("description")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Account;
