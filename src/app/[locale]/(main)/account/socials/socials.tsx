"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn, requestAPI } from "@/lib/utils";

type SocialsProps = {
    googleId?: string | null;
};

export const Socials: React.FC<SocialsProps> = ({ googleId }) => {
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
                <ul role="list" className="divide-y divide-neutral/20">
                    <li className="flex justify-between gap-x-2 py-5">
                        <div className="flex min-w-0 gap-x-4">
                            <Image
                                src="/images/icons/google.png"
                                alt="Google"
                                width={256}
                                height={256}
                                className="size-14 rounded-xl"
                            />
                            <div className="min-w-0 flex-auto">
                                <p className="text-lg">
                                    <span className="font-bold">Google</span>
                                </p>
                                <p className="mt-1 text-sm text-neutral">
                                    {t("google")}
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-start gap-4 ">
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    className={cn(
                                        "btn",
                                        google ? "btn-error" : "btn-primary"
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
