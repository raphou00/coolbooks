import axios from "axios";
import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Stripe, loadStripe } from "@stripe/stripe-js";
import env from "./env";
import type { ActionsState } from "./types";

let stripePromise: Promise<Stripe | null>;

export default function getStripe(): Promise<Stripe | null> {
    if (!stripePromise)
        stripePromise = loadStripe(
            env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
        );

    return stripePromise;
}

export const cn = (...args: ClassValue[]): string | undefined =>
    twMerge(clsx(args));

export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const createSixDigitNumber = () =>
    Array.from({ length: 6 }, () =>
        String(Math.floor(Math.random() * 10))
    ).join("");

export const handleFormPost = async <T>(
    url: string,
    data: unknown,
    headers?: Record<string, string>
): Promise<ActionsState<T>> => {
    const res = await axios.post<ActionsState<T>>(`${url}`, data, {
        headers: headers || {
            "Content-Type": "application/json",
        },
    });

    const resData = res.data;

    if (resData.redirect) {
        window.location.href = resData.redirect;
    }

    return resData;
};

export const formatAmountForDisplay = (
    amount: number,
    currency: string
): string => {
    const numberFormat = new Intl.NumberFormat(["en-US"], {
        style: "currency",
        currency: currency,
        currencyDisplay: "symbol",
    });

    return numberFormat.format(amount);
};

export const formatAmountForStripe = (
    amount: number,
    currency: string
): number => {
    const numberFormat = new Intl.NumberFormat(["en-US"], {
        style: "currency",
        currency: currency,
        currencyDisplay: "symbol",
    });

    const parts = numberFormat.formatToParts(amount);

    let zeroDecimalCurrency: boolean = true;
    for (const part of parts) {
        if (part.type === "decimal") {
            zeroDecimalCurrency = false;
        }
    }

    return zeroDecimalCurrency ? amount : Math.round(amount * 100);
};

export const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    return [
        h > 0 ? h.toString().padStart(2, "0") : null,
        m.toString().padStart(2, "0"),
        s.toString().padStart(2, "0"),
    ]
        .filter(Boolean)
        .join(":");
};

export const getImage = (key: string) => {
    return `${env.NEXT_PUBLIC_CLOUDFRONT_URL}/${key}`;
};
