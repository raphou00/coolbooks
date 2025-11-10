"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import {
    BookOpenText,
    CheckCircle2,
    HelpCircle,
    Lock,
    LockOpen,
    RotateCw,
    Save,
    Trash2,
} from "lucide-react";
import { cn, handleFormPost, sortPages } from "@/lib/utils";
import type { ActionsState } from "@/lib/types";
import type { BookEditSchema } from "@/schema/book-edit";
import type { PageEditSchema } from "@/schema/page-edit";
import { ageOptions, themesOptions } from "@/schema/book";
import { colors } from "@/config/colors";
import FormButton from "@/components/ui/form-button";
import Title from "@/components/ui/title";
import FormSelect from "@/components/ui/form-select";
import NextImage from "@/components/ui/image";
import FormInput from "@/components/ui/form-input";
import Logo from "@/components/ui/logo";
import DeleteBook from "@/components/ui/delete-book";

type EditProps = {
    bookId: string;
    userId: string;
};

type Book = {
    id: string;
    generating: boolean;
    title: string;
    cover: string;
    public: boolean;
    age: string;
    themes: string[];
    user: {
        id: string;
        name: string;
    };
    pages: {
        id: string;
        image: string;
        text: string;
        color: string;
        number: number;
    }[];
    updatedAt: Date;
};

type BookResponse = ActionsState<Book> & {
    book: Book;
};

const themeImages: Record<string, string> = {
    hero: "🦸",
    adventure: "🕵️‍♂️",
    education: "👨‍🎓",
    friendship: "👫",
    magic: "🧙",
    bedtime: "😴",
};

const fetcher = (...args: Parameters<typeof fetch>) =>
    fetch(...args).then((res) => res.json());

const Edit: React.FC<EditProps> = ({ bookId, userId }) => {
    const t = useTranslations("pages.edit-book");
    const { data, isLoading } = useSWR<BookResponse>(
        `/api/book?bookId=${bookId}`,
        fetcher,
        {
            refreshInterval: 10000,
        }
    );

    const [book, setBook] = useState<Book | null>(null);
    const [page, setPage] = useState<{
        id: string;
        image: string;
        text: string;
        color: string;
    } | null>(null);
    const [contentMode, setContentMode] = useState("image");
    const [selectedColor, setSelectedColor] = useState(colors[0].name);

    const [bookState, setBookState] = useState<ActionsState<BookEditSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });

    const {
        control,
        watch,
        setValue,
        register,
        handleSubmit,
        formState: { errors, isSubmitting: bookLoading },
    } = useForm<BookEditSchema>();

    const {
        register: pageRegister,
        handleSubmit: handlePageSubmit,
        setValue: setPageValue,
        formState: { isSubmitting: pageLoading },
    } = useForm<PageEditSchema>();

    const themes = watch("themes");

    const isCoverPage = page?.id === "";

    const submitBook = async (data: BookEditSchema) => {
        const bookData = {
            ...data,
            id: bookId,
        };

        const res = await handleFormPost<BookEditSchema>(
            "/api/book/update",
            bookData
        );
        setBookState(res);

        if (res.success) toast.success(res.message!);
        else toast.error(res.message!);
    };

    const submitPage = async (data: PageEditSchema) => {
        if (isCoverPage) return;

        const pageData = {
            ...data,
            color:
                colors.find((c) => c.name === selectedColor)?.hex ||
                colors[0].hex,
            id: page!.id,
        };

        const res = await handleFormPost<PageEditSchema>(
            "/api/page/update",
            pageData
        );

        if (res.success) toast.success(res.message!);
        else toast.error(res.message!);

        if (res.success && book && page) {
            const updatedBook = { ...book };
            const pageIndex = updatedBook.pages.findIndex(
                (p) => p.id === page.id
            );

            if (pageIndex !== -1) {
                updatedBook.pages[pageIndex] = {
                    ...updatedBook.pages[pageIndex],
                    text: data.text,
                    color: pageData.color,
                };
                setBook(updatedBook);

                setPage({
                    ...page,
                    text: data.text,
                    color: pageData.color,
                });
            }
        }
    };

    const handlePageSelect = (selectedPage: {
        id: string;
        image: string;
        text: string;
        color: string;
    }) => {
        setPage(selectedPage);
        setContentMode("image");

        if (selectedPage.id !== "") {
            setPageValue("text", selectedPage.text || "");
            const colorName =
                colors.find((c) => c.hex === selectedPage.color)?.name ||
                colors[0].name;
            setPageValue("color", colorName);
            setSelectedColor(colorName);
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (!page) return;

        setPageValue("text", e.target.value);
        setPage({ ...page, text: e.target.value });
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (!page) return;

        const newColor = e.target.value;
        const colorHex =
            colors.find((c) => c.name === newColor)?.hex || colors[0].hex;

        setSelectedColor(newColor);
        setPageValue("color", newColor);
        setPage({ ...page, color: colorHex });
    };

    const resetBook = () => {
        if (!book) return;

        setValue("title", book.title);
        setValue("public", book.public);
        setValue("themes", book.themes as (typeof themesOptions)[number][]);
        setValue("age", book.age as (typeof ageOptions)[number]);
    };

    useEffect(() => {
        if (!data) return;
        if (data && !data.book) return;
        if (data.book.user.id !== userId) return redirect("/404");

        const bookData = data.book;
        setBook(bookData);

        const coverPage = {
            id: "",
            image: bookData.cover,
            text: "",
            color: colors[0].hex,
        };
        setPage(coverPage);

        setValue("title", bookData.title);
        setValue("public", bookData.public);
        setValue("themes", bookData.themes as (typeof themesOptions)[number][]);
        setValue("age", bookData.age as (typeof ageOptions)[number]);
    }, [data, userId, setValue]);

    if (data && data.book && data.book.user.id !== userId)
        return redirect("/404");

    if (data && data.book && data.book.generating)
        return (
            <>
                <EditPageSkeleton />
                <div
                    className={cn(
                        "absolute top-[50vh] left-1/2 -translate-x-1/2 -translate-y-1/2",
                        "flex flex-col justify-center items-center",
                        "p-8 bg-base-100 rounded-2xl shadow"
                    )}
                >
                    <Logo className="size-20 animate-spin" />
                    <Title text={t("generating")} className="text-lg mt-4" />
                </div>
            </>
        );

    if (isLoading || !book || !page) {
        return <EditPageSkeleton />;
    }

    return (
        <>
            <div className="flex items-center justify-between mb-2">
                <div className="flex gap-3">
                    <button
                        type="button"
                        className={cn(
                            "btn btn-square btn-xl rounded-sm overflow-hidden",
                            contentMode === "image" ?
                                "btn-active border-2 border-primary"
                            :   "border-gray-300 bg-white"
                        )}
                        onClick={() => setContentMode("image")}
                    >
                        <NextImage
                            src={page.image}
                            className="size-full select-none"
                            alt={page.text}
                            width={1024}
                            height={1024}
                        />
                    </button>
                    <button
                        type="button"
                        className={cn(
                            "btn btn-square btn-xl rounded-sm overflow-hidden text-base",
                            contentMode === "text" ?
                                "btn-active border-2 border-primary"
                            :   "border-gray-300 bg-white"
                        )}
                        onClick={() => setContentMode("text")}
                        disabled={isCoverPage}
                    >
                        {t("text")}
                    </button>
                </div>
                <div className="flex gap-x-2">
                    <DeleteBook
                        bookId={book.id}
                        callback={() => window.location.replace("/studio")}
                    >
                        <button className="btn btn-soft btn-error">
                            <Trash2 className="size-5" />
                            {t("delete")}
                        </button>
                    </DeleteBook>

                    <Link href={`/book/${bookId}`} className="btn btn-primary">
                        <BookOpenText className="stroke-2 size-5" />
                        {t("read")}
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                <div className="flex items-center justify-center">
                    {contentMode === "image" ?
                        <NextImage
                            src={page.image}
                            className="max-lg:max-h-[500px] max-lg:max-w-[500px] rounded-2xl shadow size-full aspect-square p-0 m-0"
                            alt={page.text}
                            width={1024}
                            height={1024}
                        />
                    :   <div
                            className="max-lg:max-h-[500px] max-lg:max-w-[500px] rounded-2xl shadow size-full aspect-square p-4 flex flex-col gap-4"
                            style={{
                                backgroundColor: page.color || colors[0].hex,
                            }}
                        >
                            <form
                                onSubmit={handlePageSubmit(submitPage)}
                                className="h-full flex flex-col gap-4"
                            >
                                <div className="flex items-center gap-3">
                                    <select
                                        {...pageRegister("color")}
                                        value={selectedColor}
                                        onChange={handleColorChange}
                                        className="select select-bordered w-fit"
                                    >
                                        {colors.map((color) => (
                                            <option
                                                key={color.name}
                                                value={color.name}
                                            >
                                                {color.name}
                                            </option>
                                        ))}
                                    </select>

                                    <FormButton
                                        title={
                                            <Save className="stroke-2 size-5" />
                                        }
                                        loading={pageLoading}
                                        className="w-min btn btn-circle size-9 aspect-square btn-primary mt-0"
                                    />
                                </div>

                                <textarea
                                    {...pageRegister("text")}
                                    value={page.text || ""}
                                    onChange={handleTextChange}
                                    className="flex-1 w-full resize-none border-none outline-none bg-transparent text-gray-800 placeholder-gray-400 text-lg leading-relaxed"
                                    placeholder="Start writing your story..."
                                />
                            </form>
                        </div>
                    }
                </div>

                <div className="bg-base-200 space-y-4 p-4 rounded-2xl shadow">
                    <div className="flex items-center justify-between gap-x-4">
                        <div className="flex space-x-4">
                            <Title
                                text={t("title")}
                                className="w-fit text-2xl"
                                underline
                            />
                            <button
                                type="button"
                                onClick={resetBook}
                                className="transition active:rotate-45"
                            >
                                <RotateCw className="stroke-2 size-5 text-neutral" />
                            </button>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit(submitBook)}
                        className="w-full flex flex-col"
                    >
                        <FormInput
                            type="text"
                            label={t("title-label")}
                            placeholder={t("title-placeholder")}
                            error={bookState.errors?.title?.[0]}
                            {...register("title")}
                        />

                        <FormSelect
                            name="age"
                            label={t("age")}
                            defaultValue={ageOptions[0]}
                            values={ageOptions as unknown as string[]}
                            control={control}
                            error={errors.age?.message}
                        />

                        <div className="w-full text-sm">
                            <div className="w-full flex justify-between pb-1">
                                <span className="label-text px-1 font-bold">
                                    {t("themes")}
                                </span>
                                <span className="label-text-alt text-error">
                                    {errors.themes?.message}
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {themesOptions.map((theme) => (
                                    <label
                                        key={theme}
                                        className={cn(
                                            "cursor-pointer flex flex-col items-center border-2 border-neutral/30 rounded-xl p-2 transition",
                                            "hover:shadow-md relative group",
                                            themes.includes(theme) &&
                                                "border-primary"
                                        )}
                                    >
                                        <div className="absolute top-0 right-0 m-px">
                                            {themes.includes(theme) ?
                                                <CheckCircle2 className="size-6 text-primary" />
                                            :   <div className="size-6 border-2 border-neutral/30 rounded-full" />
                                            }
                                        </div>
                                        <input
                                            type="checkbox"
                                            value={theme}
                                            className="absolute left-2 top-2 opacity-0 group-checked:border-primary"
                                            {...register("themes")}
                                        />
                                        <span className="capitalize text-xl text-center">
                                            {themeImages[theme]}
                                        </span>
                                        <span className="capitalize text-sm text-center">
                                            {t(theme)}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="w-fit flex gap-x-2 mt-2">
                            <div className="w-full flex items-center justify-between">
                                <span className="label-text size-full px-1 text-lg font-bold flex items-center gap-x-1">
                                    {t("public")}
                                    <div
                                        className="bg-neutral rounded-full tooltip tooltip-accent"
                                        data-tip={t("public-tip")}
                                    >
                                        <HelpCircle className="size-4 text-white" />
                                    </div>
                                </span>
                                <span className="label-text-alt text-error">
                                    {bookState.errors?.public?.[0]}
                                </span>
                            </div>
                            <label className="toggle toggle-secondary toggle-xl">
                                <input
                                    type="checkbox"
                                    {...register("public")}
                                />
                                <div
                                    aria-label="enabled"
                                    className="size-full flex items-center justify-center"
                                >
                                    <Lock className="size-4" />
                                </div>
                                <div
                                    aria-label="disabled"
                                    className="size-full flex items-center justify-center"
                                >
                                    <LockOpen className="size-4" />
                                </div>
                            </label>
                        </div>

                        <FormButton
                            title={t("submit")}
                            loading={bookLoading}
                            className="w-full btn-primary"
                        />
                    </form>
                </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-8">
                <div
                    className={cn(
                        "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 border-2 border-transparent shadow-sm hover:shadow-md hover:-translate-y-0.5",
                        isCoverPage && "border-primary shadow"
                    )}
                    onClick={() =>
                        handlePageSelect({
                            id: "",
                            image: book.cover,
                            text: "",
                            color: colors[0].hex,
                        })
                    }
                >
                    <div className="relative w-full h-24 flex items-center justify-center overflow-hidden">
                        <NextImage
                            src={book.cover}
                            alt="Book Cover"
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div
                        className={cn(
                            "px-2 py-1.5 text-center text-sm font-medium bg-base-200",
                            isCoverPage && "text-primary"
                        )}
                    >
                        Cover
                    </div>
                </div>

                {sortPages(book.pages).map((bookPage, index) => (
                    <div
                        key={bookPage.id}
                        className={cn(
                            "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 border-2 border-transparent shadow-sm hover:shadow-md hover:-translate-y-0.5",
                            page?.id === bookPage.id && "border-primary shadow"
                        )}
                        onClick={() => handlePageSelect(bookPage)}
                    >
                        <div
                            className="relative w-full h-24 flex items-center justify-center overflow-hidden"
                            style={{
                                backgroundColor:
                                    bookPage.color || colors[0].hex,
                            }}
                        >
                            <NextImage
                                src={bookPage.image}
                                alt=""
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div
                            className={cn(
                                "px-2 py-1.5 text-center text-sm font-medium bg-base-200",
                                page?.id === bookPage.id && "text-primary"
                            )}
                        >
                            {t("page")} {index + 1}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

const EditPageSkeleton: React.FC = () => {
    return (
        <>
            <div className="flex flex-col gap-3 mb-2">
                <div className="flex gap-3">
                    <div className="btn btn-square btn-xl rounded-sm bg-gray-200 animate-pulse"></div>
                    <div className="btn btn-square btn-xl rounded-sm bg-gray-200 animate-pulse"></div>
                </div>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mb-8">
                <div className="flex items-center justify-center">
                    <div className="max-lg:max-h-[500px] max-lg:max-w-[500px] rounded-2xl shadow bg-gray-200 animate-pulse size-full aspect-square"></div>
                </div>

                <div className="bg-base-200 space-y-4 p-4 aspect-square rounded-2xl shadow">
                    <div className="flex justify-between gap-x-4">
                        <div className="flex items-center gap-x-2">
                            <div className="h-8 bg-gray-300 rounded animate-pulse w-24"></div>
                            <div className="h-6 w-6 bg-gray-300 rounded animate-pulse"></div>
                        </div>
                        <div className="h-6 w-12 bg-gray-300 rounded animate-pulse"></div>
                    </div>

                    <div className="w-full flex flex-col space-y-4">
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-300 rounded animate-pulse w-16"></div>
                            <div className="h-12 bg-gray-300 rounded animate-pulse w-full"></div>
                        </div>

                        <div className="space-y-2">
                            <div className="h-4 bg-gray-300 rounded animate-pulse w-12"></div>
                            <div className="h-12 bg-gray-300 rounded animate-pulse w-full"></div>
                        </div>

                        <div className="space-y-2">
                            <div className="h-4 bg-gray-300 rounded animate-pulse w-16"></div>
                            <div className="grid grid-cols-3 gap-3">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="border-2 border-neutral/30 rounded-xl p-2 bg-gray-200 animate-pulse h-20"
                                    ></div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="h-4 bg-gray-300 rounded animate-pulse w-12"></div>
                                <div className="h-4 w-4 bg-gray-300 rounded-full animate-pulse"></div>
                            </div>
                            <div className="h-8 w-16 bg-gray-300 rounded-full animate-pulse"></div>
                        </div>

                        <div className="h-12 bg-gray-300 rounded animate-pulse w-full"></div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                <div className="rounded-lg overflow-hidden shadow-sm">
                    <div className="w-full h-24 bg-gray-200 animate-pulse"></div>
                    <div className="px-2 py-1.5 bg-base-200">
                        <div className="h-4 bg-gray-300 rounded animate-pulse mx-auto w-12"></div>
                    </div>
                </div>

                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-lg overflow-hidden shadow-sm"
                    >
                        <div className="w-full h-24 bg-gray-200 animate-pulse"></div>
                        <div className="px-2 py-1.5 bg-base-200">
                            <div className="h-4 bg-gray-300 rounded animate-pulse mx-auto w-16"></div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default Edit;
