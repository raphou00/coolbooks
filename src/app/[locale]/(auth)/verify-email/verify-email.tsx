"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Form from "@/components/ui/form";
import FormOTP from "@/components/ui/form-otp";
import FormButton from "@/components/ui/form-button";
import FormReponse from "@/components/ui/form-response";
import { type ActionsState } from "@/lib/types";
import { type VerifyEmailSchema } from "@/schema/verify-email";
import { useTranslations } from "next-intl";
import { handleFormPost } from "@/lib/utils";

const VerifyEmail: React.FC = () => {
    const t = useTranslations("pages.verify-email");
    const [state, setState] = useState<ActionsState<VerifyEmailSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm<VerifyEmailSchema>();

    const [otp, setOtp] = useState<string>("");

    const submit = async () => {
        const res = await handleFormPost<VerifyEmailSchema>(
            "/api/auth/verify-email",
            { otp }
        );
        setState(res);
    };

    const resendVerifyEmail = async () => {
        await axios.get("/api/auth/resend-verify-email");
    };

    return (
        <Form title={t("title")} description={t("description")}>
            <form
                onSubmit={handleSubmit(submit)}
                className="w-full  flex flex-col gap-y-2"
            >
                <FormReponse success={state.success} message={state.message} />

                <input type="hidden" name="otp" value={otp} />

                <div className="mx-auto">
                    <FormOTP
                        label={t("otp")}
                        error={state.errors?.otp![0]}
                        value={otp}
                        setValue={setOtp}
                    >
                        <div className="label">
                            <button
                                type="button"
                                onClick={resendVerifyEmail}
                                className="link label-text link-primary"
                            >
                                {t("resend")}
                            </button>
                        </div>
                    </FormOTP>
                </div>

                <FormButton title={t("submit")} loading={loading} />
            </form>
        </Form>
    );
};

export default VerifyEmail;
