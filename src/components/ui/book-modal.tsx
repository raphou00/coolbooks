"use client";

import { useTranslations } from "next-intl";
import Modal from "@/components/ui/modal";
import Title from "@/components/ui/title";
import { useState } from "react";
import { ActionsState } from "@/lib/types";
import { type BookSchema } from "@/schema/book";
import { useForm } from "react-hook-form";
import { handleFormPost } from "@/lib/utils";
import Form from "./form";
import FormButton from "./form-button";
import FormReponse from "./form-response";

type LocaleModalProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const LocaleModal: React.FC<LocaleModalProps> = ({ open, setOpen }) => {
    const t = useTranslations("pages.new-book");
    const [state, setState] = useState<ActionsState<BookSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm<BookSchema>();

    const submit = async (data: BookSchema) => {
        const res = await handleFormPost<BookSchema>("/api/book", data);
        setState(res);
    };

    return (
        <Modal isOpen={open} setIsOpen={setOpen} className="z-100 w-full">
            <div className="flex flex-col items-center justify-center mx-auto gap-y-6 w-full max-w-lg p-6">
                <div className="w-full">
                    <Form title={t("title")} logo={false}>
                        <form
                            onSubmit={handleSubmit(submit)}
                            className="w-full flex flex-col gap-y-2"
                        >
                            <FormReponse
                                success={state.success}
                                message={state.message}
                            />

                            <div className="w-full">
                                <label className="w-full text-sm">
                                    <div className="w-full flex justify-between pb-1">
                                        <span className="label-text px-1 font-bold">
                                            {t("prompt")}
                                        </span>
                                        <span className="label-text-alt text-error">
                                            {state.errors?.prompt?.[0]}
                                        </span>
                                    </div>
                                    <textarea
                                        placeholder={t("prompt-placeholder")}
                                        className="textarea w-full rounded-box resize-none border-2 bg-base-100 transition placeholder:text-neutral-400 focus:border-primary/50 focus:outline-none focus:bg-base-300"
                                        rows={5}
                                        {...register("prompt")}
                                    />
                                </label>
                            </div>

                            <FormButton title={t("submit")} loading={loading} />
                        </form>
                    </Form>
                </div>
            </div>
        </Modal>
    );
};

export default LocaleModal;
