"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Form from "@/components/ui/form";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import FormReponse from "@/components/ui/form-response";
import { type ActionsState } from "@/lib/types";
import { type LoginSchema } from "@/schema/login";
import { useTranslations } from "next-intl";
import { handleFormPost } from "@/lib/utils";

const Login: React.FC = () => {
    const t = useTranslations("pages.login");
    const [state, setState] = useState<ActionsState<LoginSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm<LoginSchema>();

    const submit = async (data: LoginSchema) => {
        const res = await handleFormPost<LoginSchema>("/api/auth/login", data);
        setState(res);
    };

    return (
        <Form title={t("title")} description={t("description")}>
            <form
                onSubmit={handleSubmit(submit)}
                className="w-full flex flex-col gap-y-2"
            >
                <FormReponse success={state.success} message={state.message} />

                <FormInput
                    type="text"
                    label={t("email")}
                    placeholder={t("email-placeholder")}
                    error={state.errors?.email![0]}
                    {...register("email")}
                />

                <FormInput
                    type="password"
                    label={t("password")}
                    placeholder={t("password-placeholder")}
                    error={state.errors?.password![0]}
                    {...register("password")}
                />

                <FormButton title={t("submit")} loading={loading} />

                <div className="label">
                    <span className="label-text-alt">
                        <Link
                            href="/forgot-password"
                            className="link link-primary"
                        >
                            {t("forgot")}
                        </Link>
                    </span>
                    <span className="label-text-alt">
                        <Link href="/register" className="link link-primary">
                            {t("register")}
                        </Link>
                    </span>
                </div>
            </form>
        </Form>
    );
};

export default Login;
