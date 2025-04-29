"use client";

import Link from "next/link";
import NextImage from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { type Girl } from "@prisma/client";
import type { StripeElementLocale } from "@stripe/stripe-js";
import {
    CardNumberElement,
    CardCvcElement,
    CardExpiryElement,
    Elements,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";
import getStripe, { formatAmountForDisplay, handleFormPost } from "@/lib/utils";
import { type ActionsState } from "@/lib/types";
import { type TipsSchema } from "@/schema/tips";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import FormReponse from "@/components/ui/form-response";
import Image from "@/components/ui/image";
import Title from "@/components/ui/title";
import { currency } from "@/config/stripe";
import { useTheme } from "next-themes";

type TipsProps = {
    girl: Girl;
};

const CheckoutForm: React.FC<TipsProps> = ({ girl }) => {
    const t = useTranslations("pages.tips");
    const [state, setState] = useState<ActionsState<TipsSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        watch,
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm<TipsSchema>({
        defaultValues: {
            modelId: girl.id,
        },
    });
    const stripe = useStripe();
    const elements = useElements();
    const { theme } = useTheme();
    const amount = watch("amount");

    const submit = async (data: TipsSchema) => {
        if (!stripe || !elements) {
            return;
        }

        const cardNumberElement = elements.getElement(CardNumberElement);
        const cardCvcElement = elements.getElement(CardCvcElement);
        const cardExpiryElement = elements.getElement(CardExpiryElement);

        console.log(cardNumberElement, cardCvcElement, cardExpiryElement);

        const { paymentMethod, error } = await stripe!.createPaymentMethod({
            type: "card",
            card: cardNumberElement!,
            billing_details: {
                name: data.name,
            },
        });

        if (error) {
            setState({
                success: false,
                message: error.message,
                errors: undefined,
            });
            return;
        }

        data.paymentMethodId = paymentMethod.id;
        data.amount = Number(amount);

        const res = await handleFormPost<TipsSchema>("/api/tips", data);
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
                        text={t("tip", { name: girl.name })}
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

                    <div className="flex flex-col">
                        <div className="label pb-1">
                            <span className="label-text font-bold">
                                {t("number")}
                            </span>
                        </div>
                        <label className="input input-bordered w-full border-2 bg-base-100 tracking-wide transition placeholder:text-neutral-400 focus:border-secondary/50 focus:outline-none focus:bg-base-300">
                            <CardNumberElement
                                className="w-full py-3"
                                options={{
                                    style: {
                                        base: {
                                            fontSize: "16px",
                                            fontWeight: "500",
                                            color:
                                                theme == "dark" ? "white" : (
                                                    "black"
                                                ),
                                        },
                                    },
                                }}
                            />
                        </label>
                    </div>

                    <div className="flex gap-x-2">
                        <div className="flex flex-col w-1/2">
                            <div className="label pb-1">
                                <span className="label-text font-bold">
                                    {t("expiry")}
                                </span>
                            </div>
                            <label className="input input-bordered w-full border-2 bg-base-100 tracking-wide transition placeholder:text-neutral-400 focus:border-secondary/50 focus:outline-none focus:bg-base-300">
                                <CardExpiryElement
                                    className="w-full py-3"
                                    options={{
                                        style: {
                                            base: {
                                                fontSize: "16px",
                                                fontWeight: "500",
                                                color:
                                                    theme == "dark" ? "white"
                                                    :   "black",
                                            },
                                        },
                                    }}
                                />
                            </label>
                        </div>

                        <div className="flex flex-col w-1/2">
                            <div className="label pb-1">
                                <span className="label-text font-bold">
                                    {t("cvc")}
                                </span>
                            </div>
                            <label className="input input-bordered w-full border-2 bg-base-100 tracking-wide transition placeholder:text-neutral-400 focus:border-secondary/50 focus:outline-none focus:bg-base-300">
                                <CardCvcElement
                                    className="w-full py-3"
                                    options={{
                                        style: {
                                            base: {
                                                fontSize: "16px",
                                                fontWeight: "500",
                                                color:
                                                    theme == "dark" ? "white"
                                                    :   "black",
                                            },
                                        },
                                    }}
                                />
                            </label>
                        </div>
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

                    <FormButton title={t("tip-now")} loading={loading} />
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

const Tips: React.FC<TipsProps> = ({ girl }) => {
    const locale = useLocale();
    return (
        <Elements
            stripe={getStripe()}
            options={{
                currency: currency.toLowerCase(),
                locale: locale as StripeElementLocale,
            }}
        >
            <CheckoutForm girl={girl} />
        </Elements>
    );
};

export default Tips;
