"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { type ActionsState } from "@/lib/types";
import { handleFormPost } from "@/lib/utils";
import Form from "@/components/ui/form";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import FormReponse from "@/components/ui/form-response";
import { type ContactSchema } from "@/schema/contact";

const Page: React.FC = () => {
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
        const res = await handleFormPost<ContactSchema>("/api/contact", data);
        setState(res);
    };

    return (
        <>
            <div className="w-full mt-8">
                <div className="relative w-full">
                    <Form
                        title={t("title")}
                        logo={false}
                        className="bg-secondary/10 px-2 md:px-5 lg:px-8 py-6 rounded-2xl max-w-lg"
                    >
                        <form
                            onSubmit={handleSubmit(submit)}
                            className="w-full space-y-2"
                        >
                            <FormReponse
                                success={state.success}
                                message={state.message}
                            />

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

                            <FormInput
                                type="text"
                                label={t("subject")}
                                placeholder={t("subject-placeholder")}
                                error={state.errors?.subject?.[0]}
                                {...register("subject")}
                            />

                            <div className="w-full">
                                <label className="w-full text-sm">
                                    <div className="w-full flex justify-between pb-1">
                                        <span className="label-text px-1 font-bold">
                                            {t("message")}
                                        </span>
                                        <span className="label-text-alt text-error">
                                            {state.errors?.message?.[0]}
                                        </span>
                                    </div>
                                    <textarea
                                        placeholder={t("message-placeholder")}
                                        className="textarea textarea-lg px-4 py-3 w-full rounded-2xl resize-none border-2 bg-base-100 transition placeholder:text-neutral-400 focus:border-primary/50 focus:outline-none focus:bg-base-300"
                                        rows={5}
                                        {...register("message")}
                                    />
                                </label>
                            </div>

                            <FormButton title={t("submit")} loading={loading} />
                        </form>
                    </Form>
                </div>
            </div>
        </>
    );
};

export default Page;
