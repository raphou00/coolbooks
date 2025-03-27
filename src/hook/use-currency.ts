import { useRouter } from "@/lib/navigation";
import { useState, useEffect } from "react";

export type ExchangeRateApi = {
    rates: {
        USD: number;
        EUR: number;
    };
};

export type ExchangeRateApiKey = keyof ExchangeRateApi["rates"];

export const useCurrency = (defaultCurrency: ExchangeRateApiKey = "USD") => {
    const [currency, setCurrency] =
        useState<ExchangeRateApiKey>(defaultCurrency);
    const [rates, setRates] = useState<ExchangeRateApi["rates"]>({
        USD: 1,
        EUR: 1,
    });
    const router = useRouter();

    useEffect(() => {
        localStorage.setItem("currency", currency);
    }, [currency]);

    useEffect(() => {
        async function fetchRates() {
            try {
                const response = await fetch(
                    "https://api.exchangerate-api.com/v4/latest/USD"
                );
                const data = await response.json();
                setRates(data.rates);
            } catch (error) {
                console.error("Error fetching exchange rates", error);
            }
        }
        fetchRates();
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedCurrency = localStorage.getItem(
                "currency"
            ) as ExchangeRateApiKey | null;
            if (storedCurrency) {
                setCurrency(storedCurrency);
            }
        }
    }, []);

    const convert = (
        amount: number,
        from: ExchangeRateApiKey = "USD",
        to: ExchangeRateApiKey = currency
    ) => {
        if (from === to) return amount;
        if (!rates[from] || !rates[to]) return amount;
        return (amount / rates[from]) * rates[to];
    };

    const setCurrencyDih = (currency: ExchangeRateApiKey) => {
        setCurrency(currency);
        router.refresh();
    };

    return { currency, setCurrency: setCurrencyDih, convert };
};
