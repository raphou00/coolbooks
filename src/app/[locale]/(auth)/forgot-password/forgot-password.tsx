"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import Form from "@/components/ui/form";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import FormReponse from "@/components/ui/form-response";
import { type ActionsState } from "@/lib/types";
import { type ForgotPasswordSchema } from "@/schema/forgot-password";
import { requestAPI } from "@/lib/utils";

const ForgotPassword: React.FC = () => {
    const t = useTranslations("pages.forgot-password");
    const [state, setState] = useState<ActionsState<ForgotPasswordSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm<ForgotPasswordSchema>();

    const submit = async (data: ForgotPasswordSchema) => {
        const res = await requestAPI<ForgotPasswordSchema>(
            "POST",
            "/api/auth/forgot-password",
            data
        );
        setState(res);
    };

    return (
        <Form title={t("title")} description={t("description")}>
            <form
                onSubmit={handleSubmit(submit)}
                className="w-full max-w-md space-y-2"
            >
                <FormReponse success={state.success} message={state.message} />

                <FormInput
                    type="email"
                    label={t("email")}
                    placeholder={t("email-placeholder")}
                    error={state.errors?.email?.[0]}
                    {...register("email")}
                />

                <FormButton title={t("submit")} loading={loading} />

                <p className="mt-5 text-center text-xs">{t("info")}</p>
            </form>
        </Form>
    );
};

export default ForgotPassword;
