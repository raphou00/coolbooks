"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { requestAPI } from "@/lib/utils";
import type { Session } from "@/lib/types";
import Date from "@/components/ui/date";
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
                <ul
                    role="list"
                    className="divide-y divide-hairline rounded-md border border-hairline"
                >
                    {sessions.length === 0 && <NoSessionResults />}
                    {sessions.map((session: Session) => (
                        <li
                            key={session.id}
                            className="flex items-start justify-between gap-4 p-4 md:p-5"
                        >
                            <div className="flex min-w-0 gap-x-4">
                                <div className="min-w-0 flex-auto">
                                    <p className="mb-2 inline-flex rounded-sm bg-surface-soft px-2 py-0.5 type-caption text-ink tabular-nums">
                                        {session.ip}
                                    </p>
                                    <p className="type-label text-ink">
                                        <span>{session.browser}</span> -{" "}
                                        {session.os}
                                    </p>
                                    <p className="type-body mt-1 text-muted">
                                        <span className="text-ink">
                                            {t("last-seen")}
                                        </span>{" "}
                                        <span>
                                            <Date date={session.updatedAt} />
                                        </span>
                                    </p>
                                    <p className="type-body mt-1 text-muted">
                                        <span className="text-ink">
                                            {t("expires")}
                                        </span>{" "}
                                        <span>
                                            <Date date={session.expiresAt} />
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-start gap-4 ">
                                <div className="flex items-center justify-center gap-2">
                                    {sessionId === session.id ?
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-mint/40 px-3 py-1 type-caption text-navy dark:text-ink">
                                            <span className="size-1.5 rounded-full bg-success-border" />
                                            {t("current")}
                                        </span>
                                    :   <button
                                            className="button-secondary button-sm text-error!"
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
