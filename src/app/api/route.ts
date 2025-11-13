import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export const GET = async () => {
    const stripeSubscription = await stripe.subscriptions.retrieve(
        "sub_1ST6zOAisjtGq0qIuXOuRLNt",
        {
            expand: ["customer"],
        }
    );

    return NextResponse.json({
        stripeSubscription,
    });
};
