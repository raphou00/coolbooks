"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { AlertCircle, Check } from "lucide-react";
import FormReponse from "@/components/ui/form-response";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import { type ActionsState } from "@/lib/types";
import { type UpdateProfileSchema } from "@/schema/update-profile";
import { handleFormPost } from "@/lib/utils";

type UpdateProfileProps = {
    email: string;
    emailVerified: boolean;
    name: string;
};

export const UpdateProfile: React.FC<UpdateProfileProps> = ({
    email,
    emailVerified,
    name,
}) => {
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
        const res = await handleFormPost<UpdateProfileSchema>(
            "/api/account/update-profile",
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
                    type="text"
                    label={t("name")}
                    placeholder={t("name-placeholder")}
                    error={state.errors?.name![0]}
                    {...register("name")}
                />

                <FormInput
                    type="email"
                    label={t("email")}
                    placeholder={t("email-placeholder")}
                    error={state.errors?.email![0]}
                    {...register("email")}
                />

                <div className="mt-6">
                    <p>{t("email-info")}</p>

                    <div className="mt-2">
                        {emailVerified ?
                            <div className="flex space-x-2 text-green-400">
                                <Check className="inline-block size-6" />
                                <p>{t("email-verified")}</p>
                            </div>
                        :   <div className="flex space-x-2 text-red-400">
                                <AlertCircle className="inline-block size-6" />
                                <p>
                                    {t.rich("email-not-verified", {
                                        link: (chunk) => (
                                            <Link
                                                href="/verify-email"
                                                className="link"
                                            >
                                                {chunk}
                                            </Link>
                                        ),
                                    })}
                                </p>
                            </div>
                        }
                    </div>
                </div>

                <div className="flex w-full justify-end">
                    <FormButton
                        title={t("submit")}
                        loading={loading}
                        className="w-52"
                    />
                </div>
            </form>
        </>
    );
};
