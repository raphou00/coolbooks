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
            "/api/auth/login",
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
                className="flex w-full flex-col gap-4"
            >
                <button
                    type="button"
                    onClick={google}
                    className="button-secondary w-full"
                >
                    <Image
                        src="/images/icons/google.png"
                        alt=""
                        className="size-5"
                        width={100}
                        height={100}
                    />
                    Google
                </button>

                <div className="flex items-center gap-4 py-2 type-eyebrow text-muted">
                    <span className="h-px flex-1 bg-hairline" />
                    {t("or")}
                    <span className="h-px flex-1 bg-hairline" />
                </div>

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

                <div className="flex w-full flex-wrap justify-between gap-2 type-body">
                    <span>
                        <Link href="/forgot-password" className="text-link">
                            {t("forgot")}
                        </Link>
                    </span>
                    <span>
                        <Link
                            href={`/register?redirect=${redirect}`}
                            className="text-link"
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
