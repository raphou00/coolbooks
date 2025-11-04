// error handling with toast
// add missing fields to old books
// test features
// add generating thing
// loading phantom
// add default color of pages

"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { ActionsState } from "@/lib/types";
import { cn, handleFormPost } from "@/lib/utils";
import NextImage from "@/components/ui/image";
import { useForm } from "react-hook-form";
import FormReponse from "@/components/ui/form-response";
import FormInput from "@/components/ui/form-input";
import {
    CheckCircle2,
    HelpCircle,
    Lock,
    LockOpen,
    RotateCw,
    Save,
} from "lucide-react";
import { BookEditSchema } from "@/schema/book-edit";
import { useTranslations } from "next-intl";
import FormButton from "@/components/ui/form-button";
import Title from "@/components/ui/title";
import { colors } from "@/config/colors";
import FormSelect from "@/components/ui/form-select";
import { ageOptions, themesOptions } from "@/schema/book";

type EditProps = {
    bookId: string;
};

type Book = {
    id: string;
    title: string;
    cover: string;
    public: boolean;
    age: string;
    themes: string[];
    user: {
        name: string;
    };
    pages: {
        image: string;
        text: string;
        color: string;
    }[];
    updatedAt: Date;
};

type BookResponse = ActionsState<Book> & {
    book: Book;
};

type PageUpdateSchema = {
    text: string;
    color: string;
    pageIndex: number;
    bookId: string;
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

const Edit: React.FC<EditProps> = ({ bookId }) => {
    const t = useTranslations("pages.edit-book");
    const { data, error, isLoading } = useSWR<BookResponse>(
        `/api/book?bookId=${bookId}`,
        fetcher
    );

    const [book, setBook] = useState<Book | null>(null);
    const [page, setPage] = useState<Book["pages"][0] | null>(null);
    const [pages, setPages] = useState<Book["pages"] | null>(null);
    const [contentMode, setContentMode] = useState("image");
    const [selectedPageIndex, setSelectedPageIndex] = useState(-1);
    const [selectedColor, setSelectedColor] = useState(colors[0].name);

    const [bookState, setBookState] = useState<ActionsState<BookEditSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });

    const [pageState, setPageState] = useState<ActionsState<PageUpdateSchema>>({
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
    } = useForm<BookEditSchema>({
        defaultValues: {
            themes: [],
        },
    });

    const {
        register: pageRegister,
        handleSubmit: handlePageSubmit,
        setValue: setPageValue,
        formState: { isSubmitting: pageLoading },
    } = useForm<PageUpdateSchema>();

    const submitBook = async (data: BookEditSchema) => {
        const res = await handleFormPost<BookEditSchema>(
            "/api/book/update",
            data
        );
        setBookState(res);
    };

    const themes = watch("themes");

    const submitPage = async (data: PageUpdateSchema) => {
        const pageData = {
            ...data,
            pageIndex: selectedPageIndex,
            bookId: bookId,
        };
        const res = await handleFormPost<PageUpdateSchema>(
            "/api/page/update",
            pageData
        );
        setPageState(res);

        if (res.success && book) {
            const updatedBook = { ...book };
            updatedBook.pages[selectedPageIndex] = {
                ...updatedBook.pages[selectedPageIndex],
                text: data.text,
                color: data.color,
            };
            setBook(updatedBook);
            setPage(updatedBook.pages[selectedPageIndex]);
        }
    };

    const handlePageSelect = (pageIndex: number) => {
        if (!pages) return;

        setSelectedPageIndex(pageIndex);

        if (pageIndex === -1) {
            setPage({ image: book!.cover, text: "", color: "" });
            setContentMode("image");
        } else {
            const selectedPage = book!.pages[pageIndex];
            setPage(selectedPage);
            setContentMode("image");

            setPageValue("text", selectedPage.text || "");
            setPageValue("color", selectedPage.color || colors[0].name);
            setSelectedColor(selectedPage.color || colors[0].name);
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPageValue("text", e.target.value);

        if (page) {
            const updatedCurrentPage = { ...page, text: e.target.value };
            setPage(updatedCurrentPage);
        }
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newColor = e.target.value;
        setSelectedColor(newColor);
        setPageValue("color", newColor);

        if (page) {
            const updatedCurrentPage = {
                ...page,
                color: colors.find((c) => c.name === newColor)?.hex || "",
            };
            setPage(updatedCurrentPage);
        }
    };

    const resetBook = () => {
        setValue("title", book!.title);
        setValue("public", book!.public);
        setValue("themes", book!.themes as (typeof themesOptions)[number][]);
        setValue("age", book!.age as (typeof ageOptions)[number]);
    };

    useEffect(() => {
        if (!data) return;

        const book = data.book;
        setBook(book);
        setPages(() => {
            const pages = [
                { image: book.cover, text: "", color: "" },
                ...book.pages,
            ];
            setPage(pages[0]);
            return pages;
        });

        setValue("title", book.title);
        setValue("public", book.public);
        setValue("themes", book.themes as (typeof themesOptions)[number][]);
        setValue("age", book.age as (typeof ageOptions)[number]);
    }, [data]);

    if (isLoading || !book || !page || !pages)
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    {isLoading && <p>Loading book...</p>}
                    {!book && !isLoading && !error && <p>Book not found</p>}
                </div>
            </div>
        );

    return (
        <>
            <div className="flex flex-col gap-3 mb-2">
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
                        disabled={pages.indexOf(page) == 0}
                    >
                        {t("text")}
                    </button>
                </div>
            </div>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 mb-8">
                <div className="flex items-center justify-center">
                    {contentMode === "image" ?
                        <NextImage
                            src={page.image}
                            className="max-h-[500px] max-w-[500px] rounded-2xl shadow select-none size-full aspect-square p-0 m-0"
                            alt={page.text}
                            width={1024}
                            height={1024}
                        />
                    :   <div
                            className="max-h-[500px] max-w-[500px] size-full aspect-square rounded-2xl shadow p-4 flex flex-col gap-4"
                            style={{
                                backgroundColor:
                                    colors.find((c) => c.name === selectedColor)
                                        ?.hex || page.color,
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

                <div className="bg-base-200 space-y-4 p-4 aspect-square rounded-2xl shadow">
                    <div className="flex gap-x-4">
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
                    <form
                        onSubmit={handleSubmit(submitBook)}
                        className="w-full flex flex-col"
                    >
                        <FormReponse
                            success={bookState.success}
                            message={bookState.message}
                        />

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

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                <div
                    className={cn(
                        "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 border-2 border-transparent shadow-sm hover:shadow-md hover:-translate-y-0.5",
                        selectedPageIndex === -1 && "border-primary shadow"
                    )}
                    onClick={() => handlePageSelect(-1)}
                >
                    <div className="relative w-full h-24 flex items-center justify-center overflow-hidden">
                        <NextImage
                            src={book.cover}
                            alt="Book Cover"
                            width={96}
                            height={96}
                            className="w-full h-full"
                        />
                    </div>
                    <div
                        className={cn(
                            "px-2 py-1.5 text-center text-sm font-medium",
                            selectedPageIndex === -1 ?
                                "bg-base-200 text-primary"
                            :   ""
                        )}
                    >
                        Cover
                    </div>
                </div>

                {book.pages.map((bookPage, index) => (
                    <div
                        key={index}
                        className={cn(
                            "cursor-pointer rounded-lg overflow-hidden transition-all duration-200 border-2 border-transparent shadow-sm hover:shadow-md hover:-translate-y-0.5",
                            selectedPageIndex === index &&
                                "border-primary shadow"
                        )}
                        onClick={() => handlePageSelect(index)}
                    >
                        <div
                            className="relative w-full h-24 flex items-center justify-center overflow-hidden"
                            style={{
                                backgroundColor: bookPage.color || "#ffffff",
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
                                selectedPageIndex === index ?
                                    "bg-base-200 text-primary"
                                :   ""
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

export default Edit;
