/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import FormReponse from "@/components/ui/form-response";
import { Link } from "@/lib/navigation";
import { type ActionsState } from "@/lib/types";
import { handleFormPost } from "@/lib/utils";

const Girls: React.FC = () => {
    const t = useTranslations("pages.login");
    const [state, setState] = useState<ActionsState<any>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm();

    const submit = async (data: any) => {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            formData.append(
                key,
                value instanceof FileList ? value[0] : (value as string)
            );
        });

        const res = await handleFormPost("/api/admin/girls", formData, {
            "Content-Type": "multipart/form-data",
        });
        setState(res);
    };

    return (
        <form
            onSubmit={handleSubmit(submit)}
            className="w-full flex flex-col gap-y-2"
        >
            <FormReponse success={state.success} message={state.message} />

            <FormInput
                type="text"
                label="Name"
                placeholder="Name..."
                {...register("name")}
            />

            <FormInput
                type="text"
                label="Username"
                placeholder="Username..."
                {...register("username")}
            />

            <FormInput
                type="text"
                label="Origin"
                placeholder="Origin..."
                {...register("origin")}
            />

            <FormInput
                type="number"
                label="Price"
                placeholder="Price..."
                {...register("price")}
            />

            <FormInput
                type="number"
                label="Likes"
                placeholder="Likes..."
                {...register("likes")}
            />

            <FormInput
                type="text"
                label="tags"
                placeholder="cute,teeen,..."
                {...register("tags")}
            />

            <textarea
                className="textarea textarea-bordered"
                placeholder="Bio..."
                {...register("bio")}
            />

            <input type="file" {...register("avatar")} />

            <input type="file" {...register("cover")} />

            <FormButton title={t("submit")} loading={loading} />

            <div className="label">
                <span className="label-text-alt">
                    <Link href="/forgot-password" className="link link-primary">
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
    );
};

export default Girls;
