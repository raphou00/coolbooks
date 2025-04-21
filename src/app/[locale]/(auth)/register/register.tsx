"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import axios from "axios";
import { type ActionsState } from "@/lib/types";
import { handleFormPost } from "@/lib/utils";
import { Link } from "@/lib/navigation";
import Form from "@/components/ui/form";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import FormReponse from "@/components/ui/form-response";
import { type RegisterSchema } from "@/schema/register";

const Register: React.FC = () => {
    const t = useTranslations("pages.register");
    const [state, setState] = useState<ActionsState<RegisterSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm<RegisterSchema>();

    const submit = async (data: RegisterSchema) => {
        const res = await handleFormPost<RegisterSchema>(
            "/api/auth/register",
            data
        );
        setState(res);
    };

    const google = async () => {
        const res = await axios.get("/api/auth/google");
        window.location.href = res.data.url;
    };

    const discord = async () => {
        const res = await axios.get("/api/auth/discord");
        window.location.href = res.data.url;
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
                    label={t("name")}
                    placeholder={t("name-placeholder")}
                    error={state.errors?.name![0]}
                    {...register("name")}
                />

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
                        <Link href="/login" className="link link-primary">
                            {t("login")}
                        </Link>
                    </span>
                </div>

                <p className="mt-5 text-center text-xs">
                    {t.rich("legal", {
                        terms: (chunk) => (
                            <Link href="/terms" className="link link-primary">
                                {chunk}
                            </Link>
                        ),
                        privacy: (chunk) => (
                            <Link href="/privacy" className="link link-primary">
                                {chunk}
                            </Link>
                        ),
                    })}
                </p>
            </form>
        </Form>
    );
};

export default Register;
