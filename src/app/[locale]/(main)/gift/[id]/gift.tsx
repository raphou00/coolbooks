"use client";

import Link from "next/link";
import NextImage from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { type Girl } from "@prisma/client";
import { formatAmountForDisplay, handleFormPost } from "@/lib/utils";
import { type ActionsState } from "@/lib/types";
import { type GiftSchema } from "@/schema/gift";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import FormReponse from "@/components/ui/form-response";
import Image from "@/components/ui/image";
import Title from "@/components/ui/title";

type TipsProps = {
    girl: Girl;
};

const CheckoutForm: React.FC<TipsProps> = ({ girl }) => {
    const t = useTranslations("pages.gift");
    const [state, setState] = useState<ActionsState<GiftSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        watch,
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm<GiftSchema>({
        defaultValues: {
            modelId: girl.id,
        },
    });
    const amount = watch("amount");

    const submit = async (data: GiftSchema) => {
        data.amount = Number(data.amount);
        const res = await handleFormPost<GiftSchema>("/api/gift", data);
        setState(res);
    };

    return (
        <>
            <div className="flex max-md:flex-col justify-center gap-x-12 mx-auto max-w-4xl mt-6">
                <form
                    onSubmit={handleSubmit(submit)}
                    className="flex flex-col gap-y-2 md:w-1/2"
                >
                    <Title
                        text={t("gift", { name: girl.name })}
                        className="text-xl md:text-2xl lg:text-3xl"
                    />

                    <FormReponse
                        success={state.success}
                        message={state.message}
                    />

                    <FormInput
                        type="number"
                        label={t("amount")}
                        placeholder={t("amount-placeholder")}
                        error={state.errors?.amount![0]}
                        {...register("amount")}
                    />

                    <FormInput
                        type="text"
                        label={t("name")}
                        placeholder={t("name-placeholder")}
                        error={state.errors?.name![0]}
                        {...register("name")}
                    />

                    <FormInput
                        type="text"
                        label={t("number")}
                        placeholder="1234 1234 1234 1234"
                        error={state.errors?.number![0]}
                        {...register("number")}
                    />

                    <div className="flex gap-x-2">
                        <FormInput
                            type="text"
                            label={t("expiry")}
                            placeholder="MM / YY"
                            error={state.errors?.expiry![0]}
                            {...register("expiry")}
                        />

                        <FormInput
                            type="text"
                            label={t("cvc")}
                            placeholder="CVC"
                            error={state.errors?.cvc![0]}
                            {...register("cvc")}
                        />
                    </div>

                    <div className="w-full flex justify-between mt-6">
                        <div className="text-sm text-base-content/80 pb-1">
                            {t("subtotal")}
                        </div>
                        <div className="text-sm">
                            {formatAmountForDisplay(amount)}
                        </div>
                    </div>

                    <div className="w-full flex justify-between">
                        <div className="text-sm text-base-content/80 pb-1">
                            {t("taxes")}
                        </div>
                        <div className="text-sm">
                            {formatAmountForDisplay(0)}
                        </div>
                    </div>

                    <div className="w-full flex justify-between border-t border-neutral/30 pt-4">
                        <div className="text-sm text-base-content/80 pb-1">
                            {t("total")}
                        </div>
                        <div className="text-sm">
                            {formatAmountForDisplay(amount)}
                        </div>
                    </div>

                    <FormButton title={t("gift-now")} loading={loading} />
                </form>
                <div className="max-md:hidden w-1/2">
                    <Image
                        src={girl.avatar}
                        alt={girl.name}
                        width={256}
                        height={256}
                        className="w-full h-full object-cover rounded-xl"
                    />
                </div>
            </div>

            <div className="flex flex-col items-center justify-center mx-auto mt-12">
                <p className="flex items-center gap-x-1">
                    {t("powered-by")}{" "}
                    <Link
                        href="https://stripe.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <NextImage
                            src="/images/cards/stripe.png"
                            alt="stripe"
                            width={50}
                            height={50}
                            className="w-auto h-6 object-contain"
                        />
                    </Link>
                </p>
                <p className="mt-2 text-sm text-center text-base-content/60 max-w-xl">
                    {t("note")}
                </p>
            </div>
        </>
    );
};

export default CheckoutForm;
