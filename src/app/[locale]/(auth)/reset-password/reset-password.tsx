"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Form from "@/components/ui/form";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import FormReponse from "@/components/ui/form-response";
import { type ActionsState } from "@/lib/types";
import { type ResetPasswordSchema } from "@/schema/reset-password";
import { useTranslations } from "next-intl";
import { requestAPI } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

const ResetPassword: React.FC = () => {
    const t = useTranslations("pages.reset-password");
    const [state, setState] = useState<ActionsState<ResetPasswordSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm<ResetPasswordSchema>();
    const searchParams = useSearchParams();
    const code = searchParams?.get("code");

    const submit = async (data: ResetPasswordSchema) => {
        const res = await requestAPI<ResetPasswordSchema>(
            "POST",
            "/api/auth/reset-password",
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
                    type="password"
                    label={t("password")}
                    placeholder={t("password-placeholder")}
                    error={state.errors?.password?.[0]}
                    {...register("password")}
                />

                <FormInput
                    type="password"
                    label={t("confirm-password")}
                    placeholder={t("confirm-password-placeholder")}
                    error={state.errors?.confirmPassword?.[0]}
                    {...register("confirmPassword")}
                />

                <input type="hidden" name="code" value={code || ""} />

                <FormButton title={t("submit")} loading={loading} />
            </form>
        </Form>
    );
};

export default ResetPassword;
