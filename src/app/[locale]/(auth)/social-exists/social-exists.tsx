"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Form from "@/components/ui/form";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import FormReponse from "@/components/ui/form-response";
import { type ActionsState } from "@/lib/types";
import { type SocialExistsSchema } from "@/schema/social-exists";
import { useTranslations } from "next-intl";
import { handleFormPost } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { redirect } from "@/lib/navigation";

const ResetPassword: React.FC = () => {
    const t = useTranslations("pages.social-exists");
    const searchParams = useSearchParams();
    const name = searchParams.get("name");
    const googleId = searchParams.get("googleId");
    const discordId = searchParams.get("discordId");
    const [state, setState] = useState<ActionsState<SocialExistsSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm<SocialExistsSchema>({
        defaultValues: {
            name: name || "",
        },
    });

    if (!name || (!googleId && !discordId)) {
        return redirect("/error?error=400");
    }

    const submit = async (data: SocialExistsSchema) => {
        const res = await handleFormPost<SocialExistsSchema>(
            "/api/auth/social-exists",
            data
        );
        setState(res);
    };

    return (
        <Form title={t("title")} description={t("description")}>
            <p className="p-0.5 text-center text-sm text-neutral">
                {t.rich("info", {
                    login: (chunk) => (
                        <Link href="/login" className="link link-primary">
                            {chunk}
                        </Link>
                    ),
                })}
            </p>
            <form
                onSubmit={handleSubmit(submit)}
                className="w-full flex flex-col gap-y-2"
            >
                <FormReponse success={state.success} message={state.message} />

                <FormInput
                    type="text"
                    label={t("email")}
                    placeholder={t("email-placeholder")}
                    error={state.errors?.email?.[0]}
                    {...register("email")}
                />

                <input type="hidden" name="name" value={name || ""} />
                <input type="hidden" name="googleId" value={googleId || ""} />
                <input type="hidden" name="discordId" value={discordId || ""} />

                <FormButton title={t("submit")} loading={loading} />
            </form>
        </Form>
    );
};

export default ResetPassword;
