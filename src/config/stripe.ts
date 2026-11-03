/** Swiss launch pricing. TWINT shows up in Checkout automatically for CHF
 *  once it is enabled under Settings → Payment methods in the Stripe Dashboard. */
export const currency = "CHF" as const;
export const price = 14.9 as const;

/**
 * Printed hardcover (includes the PDF and Swiss shipping). Off until Gelato
 * is set up in production; NEXT_PUBLIC_PRINT_ENABLED=true turns it on
 * (local.example.env does, so it can be tested locally).
 */
export const printEnabled = process.env.NEXT_PUBLIC_PRINT_ENABLED === "true";
export const printPrice = 44.9 as const;
/** Printed books ship to Switzerland only (Gelato prints them in CH). */
export const shippingCountries = ["CH"] as const;
/** Last day to order a printed book for delivery before Christmas. */
export const christmasPrintDeadline = "2026-12-14";

/** Free page redraws per book ("you'll love it or we redo it"). */
export const maxRedraws = 3;
/** A paid book is retried this many times before it is refunded. */
export const maxGenerationAttempts = 3;

export const priceFor = (product: "PDF" | "PRINT") =>
    product === "PRINT" ? printPrice : price;
