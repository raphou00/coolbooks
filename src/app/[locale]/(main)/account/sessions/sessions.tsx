"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { type Session } from "@prisma/client";
import { handleFormPost } from "@/lib/utils";
import Date from "@/components/ui/date";
import Title from "@/components/ui/title";

type SessionsProps = {
    sessions: Session[];
    sessionId: string;
};

export const LogoutSessions: React.FC<SessionsProps> = ({
    sessions: _sessions,
    sessionId,
}) => {
    const t = useTranslations("pages.account-sessions");
    const [sessions, setSessions] = useState<Session[]>(_sessions);

    const logoutSession = async (sessionId: string) => {
        const res = await handleFormPost<string>(
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
                <ul role="list" className="divide-y divide-neutral">
                    {sessions.map((session: Session) => (
                        <li
                            key={session.id}
                            className="flex justify-between gap-x-2 py-5"
                        >
                            <div className="flex min-w-0 gap-x-4">
                                <div className="min-w-0 flex-auto">
                                    <p className="badge badge-ghost badge-outline badge-lg mt-1">
                                        {session.ip}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-bold">
                                            {session.browser}
                                        </span>{" "}
                                        - {session.os}
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-bold">
                                            {t("last-seen")}
                                        </span>{" "}
                                        <Date date={session.updatedAt} />
                                    </p>
                                    <p className="mt-1 text-xs">
                                        <span className="font-bold">
                                            {t("expires")}
                                        </span>{" "}
                                        <Date date={session.expiresAt} />
                                    </p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-start gap-4 ">
                                <div className="flex items-center justify-center gap-2">
                                    {sessionId === session.id ?
                                        <Title
                                            text={t("current")}
                                            className="font-bold text-primary"
                                        />
                                    :   <button
                                            className="btn btn-sm text-error"
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
