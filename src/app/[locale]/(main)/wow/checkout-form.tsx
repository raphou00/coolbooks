import React, { useState, useEffect } from "react";
import {
    PaymentElement,
    useStripe,
    useElements,
} from "@stripe/react-stripe-js";

interface CheckoutFormProps {
    amount: number;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export default function CheckoutForm({
    amount,
    onSuccess,
    onError,
}: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!stripe) {
            return;
        }

        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );

        if (!clientSecret) {
            return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            switch (paymentIntent?.status) {
                case "succeeded":
                    setMessage("Payment succeeded!");
                    onSuccess?.();
                    break;
                case "processing":
                    setMessage("Your payment is processing.");
                    break;
                case "requires_payment_method":
                    setMessage(
                        "Your payment was not successful, please try again."
                    );
                    break;
                default:
                    setMessage("Something went wrong.");
                    break;
            }
        });
    }, [stripe, onSuccess]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success`,
            },
        });

        if (error) {
            if (
                error.type === "card_error" ||
                error.type === "validation_error"
            ) {
                setMessage(error.message || "An error occurred");
                onError?.(error.message || "An error occurred");
            } else {
                setMessage("An unexpected error occurred.");
                onError?.("An unexpected error occurred.");
            }
        }

        setIsLoading(false);
    };

    const paymentElementOptions = {
        layout: "tabs" as const,
    };

    return (
        <form
            id="payment-form"
            onSubmit={handleSubmit}
            className="max-w-md mx-auto"
        >
            <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Complete Payment</h2>
                <p className="text-gray-600">Amount: CHF {amount.toFixed(2)}</p>
            </div>

            <PaymentElement
                id="payment-element"
                options={paymentElementOptions}
            />

            <button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
                <span id="button-text">
                    {isLoading ?
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Processing...
                        </div>
                    :   `Pay CHF ${amount.toFixed(2)}`}
                </span>
            </button>

            {message && (
                <div
                    id="payment-message"
                    className={`mt-4 p-3 rounded ${
                        message.includes("succeeded") ?
                            "bg-green-100 text-green-800"
                        :   "bg-red-100 text-red-800"
                    }`}
                >
                    {message}
                </div>
            )}
        </form>
    );
}
