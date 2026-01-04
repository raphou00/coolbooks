"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import FormReponse from "@/components/ui/form-response";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import { type ActionsState } from "@/lib/types";
import { type UpdateProfileSchema } from "@/schema/update-profile";
import { requestAPI } from "@/lib/utils";

type UpdateProfileProps = {
    email: string;
    name: string;
};

const UpdateProfile: React.FC<UpdateProfileProps> = ({ email, name }) => {
    const t = useTranslations("pages.account-profile");
    const [state, setState] = useState<ActionsState<UpdateProfileSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm<UpdateProfileSchema>({
        defaultValues: {
            name,
            email,
        },
    });

    const submit = async (data: UpdateProfileSchema) => {
        const res = await requestAPI<UpdateProfileSchema>(
            "POST",
            "/api/account/update-profile",
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
                    type="text"
                    label={t("name")}
                    placeholder={t("name-placeholder")}
                    error={state.errors?.name?.[0]}
                    {...register("name")}
                />

                <FormInput
                    type="email"
                    label={t("email")}
                    placeholder={t("email-placeholder")}
                    error={state.errors?.email?.[0]}
                    {...register("email")}
                />

                <div className="flex w-full justify-end">
                    <FormButton
                        title={t("submit")}
                        loading={loading}
                        className="w-min"
                    />
                </div>
            </form>
        </>
    );
};

export default UpdateProfile;
