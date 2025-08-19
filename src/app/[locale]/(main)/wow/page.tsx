"use client";

import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./checkout-form";
import getStripe from "@/lib/utils";

export default function CheckoutPage() {
    const [clientSecret, setClientSecret] = useState("");
    const [amount] = useState(10);

    useEffect(() => {
        fetch("/api/stripe/checkout/one-time", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount, currency: "chf" }),
        })
            .then((res) => res.json())
            .then((data) => setClientSecret(data.clientSecret));
    }, [amount]);

    const appearance = {
        theme: "stripe" as const,
        variables: {
            colorPrimary: "#2563eb",
        },
    };

    const options = {
        clientSecret,
        appearance,
    };

    const handleSuccess = () => {
        console.log("Payment successful!");
        // Redirect or show success message
    };

    const handleError = (error: string) => {
        console.error("Payment error:", error);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-center mb-8">
                        Checkout
                    </h1>

                    {clientSecret && (
                        <Elements options={options} stripe={getStripe()}>
                            <CheckoutForm
                                amount={amount}
                                onSuccess={handleSuccess}
                                onError={handleError}
                            />
                        </Elements>
                    )}

                    {!clientSecret && (
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Loading...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
