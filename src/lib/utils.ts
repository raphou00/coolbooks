import axios, { type ResponseType } from "axios";
import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import toast from "react-hot-toast";
import { type Stripe, loadStripe } from "@stripe/stripe-js";
import { currency } from "@/config/stripe";
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

export const requestAPI = async <T>(
    method: string,
    url: string,
    body: unknown = null,
    headers: Record<string, string> = {},
    responseType: ResponseType = "json"
): Promise<ActionsState<T>> => {
    const res = await axios.request<ActionsState<T>>({
        method,
        url,
        data: body || null,
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        responseType: responseType || "json",
    });

    const data = res.data;

    if (responseType !== "json") {
        return data;
    }

    if (!data.success && data.message) {
        toast.error(data.message!);
    }

    if (data.redirect) {
        window.location.href = data.redirect;
    }

    return data;
};

export const formatAmountForDisplay = (amount: number): string => {
    const numberFormat = new Intl.NumberFormat(["en-US"], {
        style: "currency",
        currency: currency,
        currencyDisplay: "symbol",
    });

    return numberFormat.format(amount);
};

export const formatAmountForStripe = (amount: number): number => {
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

export const formatNumber = (n: number): string => {
    if (n >= 1_000_000)
        return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "m";
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    return n.toString();
};

export const getImage = (key: string) => {
    return `${env.NEXT_PUBLIC_CLOUDFRONT_URL}/${key}`;
};

export const getExtension = (filename: string) => {
    const parts = filename.split(".");
    return parts[parts.length - 1];
};
