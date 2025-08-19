import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { currency } from "@/config/stripe";

export const POST = async () => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: 10000,
            currency,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        return NextResponse.json(
            { error: "Error creating payment intent" },
            { status: 500 }
        );
    }
};
