"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { type ActionsState } from "@/lib/types";
import { requestAPI } from "@/lib/utils";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import FormReponse from "@/components/ui/form-response";
import { type ContactSchema } from "@/schema/contact";

type ContactProps = {
    senderEmail: string;
};

const Page: React.FC<ContactProps> = ({ senderEmail }) => {
    const t = useTranslations("pages.contact");
    const [state, setState] = useState<ActionsState<ContactSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm<ContactSchema>();

    const submit = async (data: ContactSchema) => {
        const res = await requestAPI<ContactSchema>(
            "POST",
            "/api/contact",
            data
        );
        setState(res);
    };

    return (
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
                <h1 className="type-display-lg text-ink">{t("title")}</h1>
                <p className="type-body-lg mt-4 text-body max-w-md">
                    {t("description")}
                </p>
                <div className="mt-8 rounded-md border-2 border-navy bg-butter p-6 text-navy shadow-[0_4px_0_#23264a]">
                    <p className="type-eyebrow text-[#4a4d6e]">{t("email")}</p>
                    <Link
                        href={"mailto:" + senderEmail}
                        className="type-title-sm mt-2 block break-all"
                    >
                        {senderEmail}
                    </Link>
                </div>
            </div>

            <form
                onSubmit={handleSubmit(submit)}
                className="sticker flex flex-col gap-4 rounded-lg! p-5 sm:p-8 lg:col-span-7"
            >
                <FormReponse success={state.success} message={state.message} />

                <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                        type="text"
                        label={t("name")}
                        placeholder={t("name-placeholder")}
                        error={state.errors?.name?.[0]}
                        {...register("name")}
                    />

                    <FormInput
                        type="text"
                        label={t("email")}
                        placeholder={t("email-placeholder")}
                        error={state.errors?.email?.[0]}
                        {...register("email")}
                    />
                </div>

                <FormInput
                    type="text"
                    label={t("subject")}
                    placeholder={t("subject-placeholder")}
                    error={state.errors?.subject?.[0]}
                    {...register("subject")}
                />

                <label className="block">
                    <span className="flex items-baseline justify-between gap-2">
                        <span className="field-label">{t("message")}</span>
                        {state.errors?.message?.[0] && (
                            <span className="type-body text-error pb-1.5">
                                {state.errors.message[0]}
                            </span>
                        )}
                    </span>
                    <textarea
                        placeholder={t("message-placeholder")}
                        className="field"
                        rows={6}
                        {...register("message")}
                    />
                </label>

                <FormButton
                    title={t("submit")}
                    loading={loading}
                    className="sm:w-fit sm:self-start"
                />
            </form>
        </div>
    );
};

export default Page;
