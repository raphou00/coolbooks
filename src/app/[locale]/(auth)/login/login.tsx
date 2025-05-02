"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import axios from "axios";
import Form from "@/components/ui/form";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import FormReponse from "@/components/ui/form-response";
import { Link } from "@/lib/navigation";
import { type ActionsState } from "@/lib/types";
import { handleFormPost } from "@/lib/utils";
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
    const redirect = searchParams.get("redirect");

    const submit = async (data: LoginSchema) => {
        const res = await handleFormPost<LoginSchema>(`/api/auth/login`, data);
        setState(res);

        if (res.success) window.location.replace(redirect || "/");
    };

    const google = async () => {
        const res = await axios.get(`/api/auth/google`);
        window.location.href = redirect || res.data.url;
    };

    const discord = async () => {
        const res = await axios.get(`/api/auth/discord`);
        window.location.href = redirect || res.data.url;
    };

    return (
        <Form title={t("title")} description={t("description")}>
            <form
                onSubmit={handleSubmit(submit)}
                className="w-full flex flex-col gap-y-2"
            >
                <div className="flex justify-between gap-x-2">
                    <button
                        type="button"
                        onClick={google}
                        className="btn text-lg w-[49%]"
                    >
                        <Image
                            src="/images/icons/google.svg"
                            alt="Google"
                            className="size-6"
                            width={100}
                            height={100}
                        />
                        Google
                    </button>

                    <button
                        type="button"
                        onClick={discord}
                        className="btn text-lg w-[49%]"
                    >
                        <Image
                            src="/images/icons/discord.svg"
                            alt="Discord"
                            className="size-6"
                            width={100}
                            height={100}
                        />
                        Discord
                    </button>
                </div>

                <div className="divider my-1" />

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
