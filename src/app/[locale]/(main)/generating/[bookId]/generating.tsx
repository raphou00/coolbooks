"use client";

import { useEffect, useMemo } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Title from "@/components/ui/title";

type GeneratingProps = {
    bookId: string;
};

type Book = {
    book: {
        generating: boolean;
    };
};

const fetcher = async (url: string) => {
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText} ${text}`);
    }
    return res.json();
};

const Generating: React.FC<GeneratingProps> = ({ bookId }) => {
    const t = useTranslations("pages.generating");
    const router = useRouter();

    const { data, isLoading } = useSWR<Book | undefined>(
        bookId ? `/api/book?bookId=${bookId}` : null,
        fetcher,
        {
            revalidateOnFocus: true,
            refreshInterval: 3000,
        }
    );

    const isGenerating = useMemo(() => {
        if (isLoading) return true;
        if (!data) return true;
        if (!data.book) return true;
        return Boolean(data.book.generating);
    }, [isLoading, data]);

    useEffect(() => {
        if (!isGenerating) {
            router.replace(`/book/${bookId}`);
            return;
        }
    }, [isGenerating, router]);

    if (isGenerating) {
        return (
            <div className="flex flex-col justify-center items-center py-16 px-4">
                <div className="relative mb-8">
                    <Image
                        src="/images/book-smiley.svg"
                        width={400}
                        height={400}
                        alt=""
                        className="h-28 md:h-48 w-auto"
                    />
                </div>
                <Title
                    text={t("title")}
                    className="text-2xl md:text-3xl text-center mb-4"
                />
                <div className="text-neutral text-center max-w-md">
                    {t("description")}
                    <div className="loading loading-sm loading-dots" />
                </div>
            </div>
        );
    }

    return null;
};

export default Generating;
