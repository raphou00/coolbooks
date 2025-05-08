"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import axios from "axios";
import toast from "react-hot-toast";

type SocialsProps = {
    googleId?: string | null;
    discordId?: string | null;
};

export const Socials: React.FC<SocialsProps> = ({ googleId, discordId }) => {
    const t = useTranslations("pages.account-socials");
    const [google, setGoogle] = useState(googleId);
    const [discord, setDiscord] = useState(discordId);

    const connectGoogle = async () => {
        if (google) {
            const res = await axios.get("/api/auth/google/disconnect");
            if (res.data.success) toast.success(res.data.message);
            else toast.error(res.data.message);
            setGoogle(null);
        } else {
            const res = await axios.get("/api/auth/google");
            window.location.href = res.data.url;
        }
    };

    const connectDiscord = async () => {
        if (google) {
            const res = await axios.get("/api/auth/discord/disconnect");
            if (res.data.success) toast.success(res.data.message);
            else toast.error(res.data.message);
            setDiscord(null);
        } else {
            const res = await axios.get("/api/auth/discord");
            window.location.href = res.data.url;
        }
    };

    return (
        <>
            <div className="">
                <ul role="list" className="divide-y divide-neutral/20">
                    <li className="flex justify-between gap-x-2 py-5">
                        <div className="flex min-w-0 gap-x-4">
                            <Image
                                src="/images/icons/google.svg"
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
                                        google ? "btn-error" : "btn-secondary"
                                    )}
                                    onClick={connectGoogle}
                                >
                                    {google ? t("disconnect") : t("connect")}
                                </button>
                            </div>
                        </div>
                    </li>
                    <li className="flex justify-between gap-x-2 py-5">
                        <div className="flex min-w-0 gap-x-4">
                            <Image
                                src="/images/icons/discord.svg"
                                alt="Discord"
                                width={256}
                                height={256}
                                className="size-14 rounded-xl"
                            />
                            <div className="min-w-0 flex-auto">
                                <p className="text-lg">
                                    <span className="font-bold">Discord</span>
                                </p>
                                <p className="mt-1 text-sm text-neutral">
                                    {t("discord")}
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-start gap-4 ">
                            <div className="flex items-center justify-center gap-2">
                                <button
                                    className={cn(
                                        "btn",
                                        discord ? "btn-error" : "btn-secondary"
                                    )}
                                    onClick={connectDiscord}
                                >
                                    {discord ? t("disconnect") : t("connect")}
                                </button>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </>
    );
};
