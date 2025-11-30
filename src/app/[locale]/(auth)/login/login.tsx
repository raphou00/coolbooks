"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import Form from "@/components/ui/form";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import FormReponse from "@/components/ui/form-response";
import Link from "next/link";
import { type ActionsState } from "@/lib/types";
import { requestAPI } from "@/lib/utils";
import { type LoginSchema } from "@/schema/login";
import { useSearchParams } from "next/navigation";

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
    const searchParams = useSearchParams();
    const redirect = searchParams?.get("redirect");

    const submit = async (data: LoginSchema) => {
        const res = await requestAPI<LoginSchema>(
            "POST",
            `/api/auth/login`,
            data
        );
        setState(res);

        if (res.success) window.location.replace(redirect || "/");
    };

    const google = async () => {
        await requestAPI("GET", "/api/auth/google");
    };

    return (
        <Form
            title={t("title")}
            description={t("description")}
            className="w-full"
        >
            <form
                onSubmit={handleSubmit(submit)}
                className="w-full max-w-md space-y-2"
            >
                <div className="flex flex-col justify-between gap-2 pt-2">
                    <button
                        type="button"
                        onClick={google}
                        className="btn btn-lg w-full"
                    >
                        <Image
                            src="/images/icons/google.png"
                            alt="Google"
                            className="size-6"
                            width={100}
                            height={100}
                        />
                        Google
                    </button>
                </div>

                <div className="divider px-4 uppercase">{t("or")}</div>

                <FormReponse success={state.success} message={state.message} />

                <FormInput
                    type="text"
                    label={t("email")}
                    placeholder={t("email-placeholder")}
                    error={state.errors?.email?.[0]}
                    {...register("email")}
                />

                <FormInput
                    type="password"
                    label={t("password")}
                    placeholder={t("password-placeholder")}
                    error={state.errors?.password?.[0]}
                    {...register("password")}
                />

                <FormButton title={t("submit")} loading={loading} />

                <div className="label w-full justify-between text-sm">
                    <span className="floating-label">
                        <Link
                            href="/forgot-password"
                            className="link link-primary"
                        >
                            {t("forgot")}
                        </Link>
                    </span>
                    <span className="floating-label">
                        <Link
                            href={`/register?redirect=${redirect}`}
                            className="link link-primary"
                        >
                            {t("register")}
                        </Link>
                    </span>
                </div>
            </form>
        </Form>
    );
};

export default Login;
