"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { type Creator } from "@prisma/client";
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
import { type PaymentSchema } from "@/schema/payment";
import { useCurrency } from "@/hook/use-currency";
import FormInput from "@/components/ui/form-input";
import FormButton from "@/components/ui/form-button";
import FormReponse from "@/components/ui/form-response";
import Image from "@/components/ui/image";

type PaymentProps = {
    creator: Creator;
};

const CheckoutForm: React.FC<PaymentProps> = ({ creator }) => {
    const t = useTranslations("pages.payment");
    const [state, setState] = useState<ActionsState<PaymentSchema>>({
        success: false,
        message: undefined,
        errors: undefined,
    });
    const {
        register,
        handleSubmit,
        formState: { isSubmitting: loading },
    } = useForm<PaymentSchema>({
        defaultValues: {
            modelId: creator.id,
        },
    });
    const stripe = useStripe();
    const elements = useElements();
    const { currency, convert } = useCurrency();

    const submit = async (data: PaymentSchema) => {
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
                email: data.email,
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

        data.currency = currency;
        data.paymentMethodId = paymentMethod.id;

        const res = await handleFormPost<PaymentSchema>("/api/payment", data);
        setState(res);
    };

    console.log(state);

    return (
        <div className="flex flex-row max-lg:flex-col gap-4 mx-auto w-2/3">
            <form
                onSubmit={handleSubmit(submit)}
                className="lg:w-1/2 flex flex-col gap-y-2"
            >
                <FormReponse success={state.success} message={state.message} />

                <FormInput
                    type="text"
                    label={t("email")}
                    placeholder={t("email-placeholder")}
                    error={state.errors?.email![0]}
                    {...register("email")}
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
                            options={{ style: { base: { fontSize: "16px" } } }}
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
                                    style: { base: { fontSize: "16px" } },
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
                                    style: { base: { fontSize: "16px" } },
                                }}
                            />
                        </label>
                    </div>
                </div>

                <FormButton
                    title={t("buy", {
                        price: formatAmountForDisplay(
                            convert(creator.price),
                            currency
                        ),
                    })}
                    loading={loading}
                />
            </form>
            <div className="lg:w-1/2">
                <Image
                    src={creator.avatar}
                    alt={creator.name}
                    width={256}
                    height={256}
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

const Payment: React.FC<PaymentProps> = ({ creator }) => {
    const locale = useLocale();
    const { currency } = useCurrency();
    return (
        <Elements
            stripe={getStripe()}
            options={{
                currency: currency.toLowerCase(),
                locale: locale as StripeElementLocale,
                fonts: [
                    {
                        cssSrc: "https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100..900;1,100..900&display=swap",
                    },
                ],
            }}
        >
            <CheckoutForm creator={creator} />
        </Elements>
    );
};

export default Payment;
