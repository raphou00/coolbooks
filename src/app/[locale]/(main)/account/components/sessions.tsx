"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { requestAPI } from "@/lib/utils";
import type { Session } from "@/lib/types";
import Date from "@/components/ui/date";
import Title from "@/components/ui/title";
import { NoSessionResults } from "@/components/ui/no-results";

type SessionsProps = {
    sessions: Session[];
    sessionId: string;
};

const LogoutSessions: React.FC<SessionsProps> = ({
    sessions: _sessions,
    sessionId,
}) => {
    const t = useTranslations("pages.account-sessions");
    const [sessions, setSessions] = useState<Session[]>(_sessions);

    const logoutSession = async (sessionId: string) => {
        const res = await requestAPI<string>(
            "POST",
            "/api/account/logout-session",
            { sessionId }
        );

        if (res.success) {
            toast.success(res.message!);
            setSessions(sessions.filter((s) => s.id !== sessionId));
        } else toast.error(res.message!);
    };

    return (
        <>
            <div className="">
                <ul role="list" className="divide-y divide-neutral/20">
                    {sessions.length === 0 && <NoSessionResults />}
                    {sessions.map((session: Session) => (
                        <li
                            key={session.id}
                            className="flex justify-between gap-x-2 py-5"
                        >
                            <div className="flex min-w-0 gap-x-4">
                                <div className="min-w-0 flex-auto">
                                    <p className="badge badge-ghost badge-primary badge-lg mb-1.5">
                                        {session.ip}
                                    </p>
                                    <p className="text-base">
                                        <span className="font-bold">
                                            {session.browser}
                                        </span>{" "}
                                        - {session.os}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-bold">
                                            {t("last-seen")}
                                        </span>{" "}
                                        <span className="text-neutral">
                                            <Date date={session.updatedAt} />
                                        </span>
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-bold">
                                            {t("expires")}
                                        </span>{" "}
                                        <span className="text-neutral">
                                            <Date date={session.expiresAt} />
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-start gap-4 ">
                                <div className="flex items-center justify-center gap-2">
                                    {sessionId === session.id ?
                                        <Title
                                            text={t("current")}
                                            className="text-xl text-primary"
                                        />
                                    :   <button
                                            className="btn btn-soft btn-error"
                                            onClick={() =>
                                                logoutSession(session.id)
                                            }
                                        >
                                            {t("delete")}
                                        </button>
                                    }
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

export default LogoutSessions;
