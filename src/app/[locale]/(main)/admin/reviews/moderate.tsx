"use client";

import { useRouter } from "next/navigation";
import { requestAPI } from "@/lib/utils";

type Row = {
    printId: string;
    rating: number;
    text: string;
    email: string;
    createdAt: string;
};

/** English only: this page is for the shop owner. */
const Moderate: React.FC<{ pending: Row[]; approved: Row[] }> = ({
    pending,
    approved,
}) => {
    const router = useRouter();
    const set = async (printId: string, value: boolean) => {
        await requestAPI("POST", "/api/admin/reviews", {
            printId,
            approved: value,
        });
        router.refresh();
    };

    const list = (rows: Row[], approve: boolean) =>
        rows.length === 0 ?
            <p className="type-body text-muted">Nothing here.</p>
        :   <ul className="space-y-3">
                {rows.map((r) => (
                    <li
                        key={r.printId}
                        className="rounded-2xl border-2 border-ink bg-white p-4"
                    >
                        <p className="type-label">
                            {"★".repeat(r.rating)}
                            {"☆".repeat(5 - r.rating)} · {r.createdAt} ·{" "}
                            {r.email}
                        </p>
                        <p className="type-body mt-2 whitespace-pre-line">
                            {r.text || "(no text)"}
                        </p>
                        <button
                            className="button-secondary button-sm mt-3"
                            onClick={() => set(r.printId, approve)}
                        >
                            {approve ? "Approve (show on site)" : "Hide"}
                        </button>
                    </li>
                ))}
            </ul>;

    return (
        <section className="mx-auto max-w-3xl space-y-8 px-4 py-12">
            <div>
                <h1 className="type-display-md">Reviews to approve</h1>
                <p className="type-body mt-2 text-muted">
                    Approve honest reviews whether positive or negative; only
                    hide spam or anything that identifies a child.
                </p>
                <div className="mt-4">{list(pending, true)}</div>
            </div>
            <div>
                <h2 className="type-title-md">Shown on the site</h2>
                <div className="mt-4">{list(approved, false)}</div>
            </div>
        </section>
    );
};

export default Moderate;
