"use client";

import { useTranslations } from "next-intl";
import type { Girl, Purchase } from "@prisma/client";
import { cn, formatAmountForDisplay } from "@/lib/utils";
import Title from "@/components/ui/title";
import Image from "@/components/ui/image";
import Date from "@/components/ui/date";
import { NoInvoicesResults } from "@/components/ui/no-results";

export type InvoiceWithGirl = Purchase & {
    girl: Girl;
};

type InvoicesProps = {
    invoices: InvoiceWithGirl[];
};

export const Invoices: React.FC<InvoicesProps> = ({ invoices }) => {
    const t = useTranslations("pages.account-invoices");

    return (
        <>
            <div className="">
                <ul role="list" className="divide-y divide-neutral">
                    {invoices.length === 0 && <NoInvoicesResults />}
                    {invoices.map((invoice: InvoiceWithGirl) => (
                        <li
                            key={invoice.id}
                            className="flex justify-between gap-x-2 py-5"
                        >
                            <div className="flex min-w-0 gap-x-4">
                                <Image
                                    src={invoice.girl.avatar}
                                    alt="avatar"
                                    width={256}
                                    height={256}
                                    className="size-20 rounded-xl"
                                />
                                <div className="min-w-0 flex-auto">
                                    <p className="text-lg">
                                        <span className="font-bold">
                                            {invoice.girl.name}
                                        </span>{" "}
                                        -{" "}
                                        <span
                                            className={cn(
                                                "font-bold text-md uppercase",
                                                invoice.status === "PAID" ?
                                                    "text-success"
                                                :   "text-error"
                                            )}
                                        >
                                            {invoice.status == "PAID" ?
                                                t("paid")
                                            :   t("unpaid")}
                                        </span>
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-bold">
                                            {t("date")}:
                                        </span>{" "}
                                        <span className="text-neutral">
                                            <Date date={invoice.createdAt} />
                                        </span>
                                    </p>
                                    <p className="text-sm">
                                        <span className="font-bold">
                                            {t("reason")}:
                                        </span>{" "}
                                        <span className="uppercase text-neutral">
                                            {invoice.reason == "PAYMENT" ?
                                                t("payment")
                                            :   t("tip")}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-start gap-4 ">
                                <div className="flex items-center justify-center gap-2">
                                    <Title
                                        text={formatAmountForDisplay(
                                            invoice.amount
                                        )}
                                        className="font-bold text-primary"
                                    />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};
