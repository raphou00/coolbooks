"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import FormReponse from "@/components/ui/form-response";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import { type ActionsState } from "@/lib/types";
import { type DeleteAccountSchema } from "@/schema/delete-account";
import { handleFormPost } from "@/lib/utils";

export const DeleteAccount: React.FC = () => {
    const t = useTranslations("pages.account-delete");
    const [state, setState] = useState<ActionsState<DeleteAccountSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm<DeleteAccountSchema>();

    const submit = async (data: DeleteAccountSchema) => {
        const res = await handleFormPost<DeleteAccountSchema>(
            "/api/account/delete-account",
            data
        );
        setState(res);

        window.location.replace("/");
    };

    return (
        <>
            <form
                onSubmit={handleSubmit(submit)}
                className="w-full  flex flex-col gap-y-2"
            >
                <FormReponse message={state.message} success={state.success} />

                <FormInput
                    type="email"
                    label={t("email")}
                    placeholder={t("email-placeholder")}
                    error={state.errors?.email![0]}
                    {...register("email")}
                />
                <p className="mt-2">{t("confirm")}</p>

                <div className="flex w-full justify-end">
                    <FormButton
                        title={t("submit")}
                        loading={loading}
                        className="w-52"
                    />
                </div>
            </form>
        </>
    );
};
