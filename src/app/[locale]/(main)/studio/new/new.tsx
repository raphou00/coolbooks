"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Check, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn, handleFormPost } from "@/lib/utils";
import Form from "@/components/ui/form";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import FormReponse from "@/components/ui/form-response";
import FormSelect from "@/components/ui/form-select";
import { type ActionsState } from "@/lib/types";
import bookSchema, {
    ageOptions,
    artStyleOptions,
    eyeColorOptions,
    genderOptions,
    hairColorOptions,
    skinToneOptions,
    themesOptions,
    type BookSchema,
} from "@/schema/book";
import Image from "next/image";

const genderImages: Record<string, string> = {
    boy: "👦",
    girl: "👧",
};

const themeImages: Record<string, string> = {
    hero: "🦸",
    adventure: "🕵️‍♂️",
    education: "👨‍🎓",
    friendship: "👫",
    magic: "🧙",
    bedtime: "😴",
};

const artStyleImages: Record<string, string> = {
    cartoon: "/images/artstyles/cartoon.png",
    "line-art": "/images/artstyles/lineart.png",
    anime: "/images/artstyles/anime.png",
};

const NewBook: React.FC = () => {
    const t = useTranslations("pages.new-book");
    const tBook = useTranslations();
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 3;

    const [state, setState] = useState<ActionsState<BookSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });

    const {
        control,
        watch,
        register,
        handleSubmit,
        trigger,
        formState: { errors, isSubmitting: loading },
    } = useForm<BookSchema>({
        resolver: zodResolver(bookSchema(tBook)),
        defaultValues: {
            themes: [themesOptions[0]],
            artStyle: artStyleOptions[0],
        },
    });

    const artStyle = watch("artStyle");
    const themes = watch("themes");
    const gender = watch("gender");

    const nextStep = async () => {
        let fieldsToValidate: (keyof BookSchema)[] = [];

        switch (currentStep) {
            case 1:
                fieldsToValidate = [
                    "childName",
                    "age",
                    "gender",
                    "hairColor",
                    "eyeColor",
                    "skinTone",
                ];
                break;
            case 2:
                fieldsToValidate = ["artStyle", "themes", "setting"];
                break;
            case 3:
                fieldsToValidate = ["prompt"];
                break;
        }

        const isValid = await trigger(fieldsToValidate);

        if (isValid && currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const submit = async (data: BookSchema) => {
        const res = await handleFormPost<BookSchema>(
            "/api/book/generate",
            data
        );
        setState(res);
    };

    const StepIndicator = () => (
        <div className="flex items-center justify-center my-6">
            {Array.from({ length: totalSteps }, (_, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isCurrent = stepNumber === currentStep;

                return (
                    <div key={stepNumber} className="flex items-center">
                        <div
                            className={cn(
                                "flex items-center justify-center size-10 rounded-full text-white font-bold text-sm",
                                isCompleted ?
                                    "bg-primary ring-6 ring-primary/40"
                                : isCurrent ? "bg-primary"
                                : "bg-gray-300 text-gray-600"
                            )}
                        >
                            {isCompleted ?
                                <Check className="w-6 h-6" />
                            :   <span className="text-lg">{stepNumber}</span>}
                        </div>

                        {stepNumber < totalSteps && (
                            <div
                                className={cn(
                                    "h-1 w-20 mx-2 rounded-full",
                                    stepNumber < currentStep ? "bg-primary" : (
                                        "bg-gray-300"
                                    )
                                )}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="w-full">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            {t("child-details")}
                        </h3>

                        <div className="space-y-4">
                            <FormInput
                                type="text"
                                label={t("child-name")}
                                placeholder={t("child-name-placeholder")}
                                error={errors.childName?.message}
                                {...register("childName")}
                            />

                            <div className="w-full text-sm mt-4">
                                <div className="w-full flex justify-between pb-1">
                                    <span className="label-text px-1 font-bold">
                                        {t("gender")}
                                    </span>
                                    <span className="label-text-alt text-error">
                                        {errors.gender?.message}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {genderOptions.map((g) => (
                                        <label
                                            key={g}
                                            className={cn(
                                                "cursor-pointer flex flex-col items-center border-2 border-neutral/30 rounded-xl p-2 transition",
                                                "hover:shadow-md relative group",
                                                gender == g && "border-primary"
                                            )}
                                        >
                                            <div className="absolute top-0 right-0 m-px">
                                                {gender == g ?
                                                    <CheckCircle2 className="size-6 text-primary" />
                                                :   <div className="size-6 border-2 border-neutral/30 rounded-full" />
                                                }
                                            </div>
                                            <input
                                                type="radio"
                                                value={g}
                                                className="absolute left-2 top-2 opacity-0 group-checked:border-primary"
                                                {...register("gender")}
                                            />
                                            <span className="capitalize text-lg text-center">
                                                {genderImages[g]} {t(g)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormSelect
                                    name="age"
                                    label={t("age")}
                                    defaultValue={ageOptions[0]}
                                    values={ageOptions as unknown as string[]}
                                    control={control}
                                    error={errors.age?.message}
                                />

                                <FormSelect
                                    name="hairColor"
                                    label={t("hair-color")}
                                    defaultValue={hairColorOptions[0]}
                                    values={
                                        hairColorOptions as unknown as string[]
                                    }
                                    control={control}
                                    error={errors.hairColor?.message}
                                    t={t}
                                />

                                <FormSelect
                                    name="eyeColor"
                                    label={t("eye-color")}
                                    defaultValue={eyeColorOptions[0]}
                                    values={
                                        eyeColorOptions as unknown as string[]
                                    }
                                    control={control}
                                    error={errors.eyeColor?.message}
                                    t={t}
                                />
                            </div>

                            <FormSelect
                                name="skinTone"
                                label={t("skin-tone")}
                                defaultValue={skinToneOptions[0]}
                                values={skinToneOptions as unknown as string[]}
                                control={control}
                                error={errors.skinTone?.message}
                                t={t}
                            />
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="w-full">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            {t("story-style")}
                        </h3>

                        <div className="space-y-6">
                            <div className="w-full text-sm">
                                <div className="w-full flex justify-between pb-1">
                                    <span className="label-text px-1 font-bold">
                                        {t("themes")}
                                    </span>
                                    <span className="label-text-alt text-error">
                                        {errors.themes?.message}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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

                            <div className="w-full text-sm">
                                <div className="w-full flex justify-between pb-1">
                                    <span className="label-text px-1 font-bold">
                                        {t("art-style")}
                                    </span>
                                    <span className="label-text-alt text-error">
                                        {errors.artStyle?.message}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {artStyleOptions.map((style) => (
                                        <label
                                            key={style}
                                            className={cn(
                                                "cursor-pointer flex flex-col items-center border-2 border-neutral/30 rounded-xl p-2 transition",
                                                "hover:shadow-md relative group",
                                                artStyle === style &&
                                                    "border-primary"
                                            )}
                                        >
                                            <div className="absolute top-0 right-0 m-px">
                                                {artStyle === style ?
                                                    <CheckCircle2 className="size-6 text-primary" />
                                                :   <div className="size-6 border-2 border-neutral/30 rounded-full" />
                                                }
                                            </div>
                                            <input
                                                type="radio"
                                                value={style}
                                                className="absolute left-2 top-2 opacity-0"
                                                {...register("artStyle")}
                                            />
                                            <Image
                                                src={artStyleImages[style]}
                                                alt={style}
                                                width={256}
                                                height={256}
                                                className="size-16 object-cover mb-2 rounded-lg"
                                            />
                                            <span className="capitalize text-sm text-center">
                                                {t(style)}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <FormInput
                                type="text"
                                label={t("setting")}
                                placeholder={t("setting-placeholder")}
                                {...register("setting")}
                            />
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="w-full">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            {t("story-idea")}
                        </h3>

                        <div className="w-full">
                            <div className="w-full">
                                <label className="w-full text-sm">
                                    <div className="w-full flex justify-between pb-1">
                                        <span className="label-text px-1 font-bold">
                                            {t("prompt")}
                                        </span>
                                        <span className="label-text-alt text-error">
                                            {errors.prompt?.message}
                                        </span>
                                    </div>
                                    <textarea
                                        placeholder={t("prompt-placeholder")}
                                        className="textarea w-full rounded-box resize-none border-2 bg-base-100 transition placeholder:text-neutral-400 focus:border-primary/50 focus:outline-none focus:bg-base-300"
                                        rows={5}
                                        {...register("prompt")}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center mx-auto gap-y-6 w-full p-6">
            <div className="w-full">
                <Form title={t("title")} logo={false}>
                    <StepIndicator />

                    <form
                        onSubmit={handleSubmit(submit)}
                        className="w-full flex flex-col gap-y-6"
                    >
                        <FormReponse
                            success={state.success}
                            message={state.message}
                        />

                        {renderStepContent()}

                        <div className="flex justify-between items-center">
                            <button
                                className="btn btn-lg max-md:btn-circle flex items-center gap-1"
                                onClick={prevStep}
                                disabled={currentStep === 1}
                                type="button"
                            >
                                <ChevronLeft className="size-5" />
                                <span className="max-md:hidden">
                                    {t("prev")}
                                </span>
                            </button>

                            {currentStep < totalSteps ?
                                <button
                                    className="btn btn-lg max-md:btn-circle flex items-center gap-1"
                                    onClick={nextStep}
                                    type="button"
                                >
                                    <span className="max-md:hidden">
                                        {t("next")}
                                    </span>
                                    <ChevronRight className="size-5" />
                                </button>
                            :   <FormButton
                                    title={t("create")}
                                    className="mt-0 w-fit btn-primary"
                                    loading={loading}
                                />
                            }
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default NewBook;
