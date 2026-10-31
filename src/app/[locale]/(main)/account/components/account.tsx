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
        <div className="mb-10 flex items-center gap-4 md:mb-14">
            <Avatar userName={user.name} className="size-14 text-lg" />
            <div className="min-w-0">
                <Title text={t("title")} className="type-display-md" />
                <p className="type-body mt-1 text-muted">{t("description")}</p>
            </div>
        </div>
    );
};

export default Account;
