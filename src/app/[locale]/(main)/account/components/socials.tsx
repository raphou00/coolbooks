"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn, requestAPI } from "@/lib/utils";

type SocialsProps = {
    googleId?: string | null;
};

const Socials: React.FC<SocialsProps> = ({ googleId }) => {
    const t = useTranslations("pages.account-socials");
    const [google, setGoogle] = useState(googleId);

    const connectGoogle = async () => {
        if (google) {
            await requestAPI("GET", "/api/auth/google/disconnect");
            setGoogle(null);
        } else {
            await requestAPI("GET", "/api/auth/google");
        }
    };

    return (
        <>
            <div className="">
                <ul role="list" className="rounded-md border border-hairline">
                    <li className="flex items-center justify-between gap-4 p-4 md:p-5">
                        <div className="flex items-center justify-center min-w-0 gap-x-4">
                            <Image
                                src="/images/icons/google.png"
                                alt="Google"
                                width={256}
                                height={256}
                                className="size-8"
                            />
                            <div className="min-w-0 flex-auto">
                                <p className="type-label text-ink">Google</p>
                                <p className="type-body text-muted">
                                    {t("google")}
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-start gap-4 ">
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    className={cn(
                                        "button-sm",
                                        google ?
                                            "button-secondary text-error!"
                                        :   "button-primary"
                                    )}
                                    onClick={connectGoogle}
                                >
                                    {google ? t("disconnect") : t("connect")}
                                </button>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default Socials;
