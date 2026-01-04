"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import FormReponse from "@/components/ui/form-response";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import { useTranslations } from "next-intl";
import { type ActionsState } from "@/lib/types";
import { type UpdatePasswordSchema } from "@/schema/update-password";
import { type CreatePasswordSchema } from "@/schema/create-password";
import { requestAPI } from "@/lib/utils";

export const UpdatePassword: React.FC = () => {
    const t = useTranslations("pages.account-password");
    const [state, setState] = useState<ActionsState<UpdatePasswordSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm<UpdatePasswordSchema>();

    const submit = async (data: UpdatePasswordSchema) => {
        const res = await requestAPI<UpdatePasswordSchema>(
            "POST",
            "/api/account/update-password",
            data
        );
        setState(res);
    };

    return (
        <>
            <form onSubmit={handleSubmit(submit)} className="w-full space-y-2">
                <div className="mb-2">
                    <FormReponse
                        message={state.message}
                        success={state.success}
                    />
                </div>

                <FormInput
                    type="password"
                    label="Current password"
                    placeholder="Enter your current password..."
                    error={state.errors?.currentPassword?.[0]}
                    {...register("currentPassword")}
                />

                <FormInput
                    type="password"
                    label="New password"
                    placeholder="Enter your new password..."
                    error={state.errors?.newPassword?.[0]}
                    {...register("newPassword")}
                />

                <FormInput
                    type="password"
                    label="Confirm password"
                    placeholder="Confirm your new password..."
                    error={state.errors?.confirmPassword?.[0]}
                    {...register("confirmPassword")}
                />

                <div className="flex w-full justify-end">
                    <FormButton
                        title={t("change")}
                        loading={loading}
                        className="w-min"
                    />
                </div>
            </form>
        </>
    );
};

export const CreatePassword: React.FC = () => {
    const t = useTranslations("pages.account-password");
    const [state, setState] = useState<ActionsState<CreatePasswordSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm<CreatePasswordSchema>();

    const submit = async (data: CreatePasswordSchema) => {
        const res = await requestAPI<CreatePasswordSchema>(
            "POST",
            "/api/account/create-password",
            data
        );
        setState(res);
    };

    return (
        <>
            <form
                onSubmit={handleSubmit(submit)}
                className="w-full  flex flex-col gap-y-2"
            >
                <div className="mb-2">
                    <FormReponse
                        message={state.message}
                        success={state.success}
                    />
                </div>

                <FormInput
                    type="password"
                    label="New password"
                    placeholder="Enter your new password..."
                    error={state.errors?.newPassword?.[0]}
                    {...register("newPassword")}
                />

                <FormInput
                    type="password"
                    label="Confirm password"
                    placeholder="Confirm your new password..."
                    error={state.errors?.confirmPassword?.[0]}
                    {...register("confirmPassword")}
                />

                <div className="flex w-full justify-end">
                    <FormButton
                        title={t("create")}
                        loading={loading}
                        className="w-min"
                    />
                </div>
            </form>
        </>
    );
};

const Password: React.FC<{ hasPassword: boolean }> = ({ hasPassword }) => {
    return hasPassword ? <UpdatePassword /> : <CreatePassword />;
};

export default Password;
