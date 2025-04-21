import { type Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/auth";
import { Invoices, type InvoiceWithGirl } from "./invoices";
import db from "@/lib/db";

const generateMetadata = async (): Promise<Metadata> => {
    const t = await getTranslations("pages");
    return {
        title: t("account-invoices.title"),
        description: t("account-invoices.description"),
    };
};

const Page = async () => {
    const user = await getUser();

    if (!user?.user) {
        redirect("/login");
    }

    const invoices = (await db.purchase.findMany({
        where: {
            userId: user.user.id,
        },
        select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
            girl: {
                select: {
                    id: true,
                    name: true,
                    avatar: true,
                },
            },
        },
    })) as InvoiceWithGirl[];

    return (
        <>
            <div className="w-full">
                <Invoices invoices={invoices} />
            </div>
        </>
    );
};

export { generateMetadata };
export default Page;
