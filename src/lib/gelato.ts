import env from "@/lib/env";
import {
    estimateCover,
    parseGelatoCover,
    type CoverDimensions,
} from "@/lib/print";

/**
 * Gelato print API. Without GELATO_API_KEY every call is a dry run: it is
 * logged and answered locally, so nothing is ever printed by accident.
 * With a key, GELATO_ORDER_TYPE=draft (the default) creates orders that
 * wait in the Gelato dashboard until you approve them.
 */
export const gelatoDryRun = !env.GELATO_API_KEY;

const call = async <T>(url: string, init?: RequestInit): Promise<T> => {
    const res = await fetch(url, {
        ...init,
        headers: {
            "content-type": "application/json",
            "X-API-KEY": env.GELATO_API_KEY ?? "",
            ...init?.headers,
        },
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`Gelato ${res.status}: ${body.slice(0, 500)}`);
    return JSON.parse(body) as T;
};

/** Cover sheet size for this page count (Gelato's numbers when we can ask). */
export const getCoverDimensions = async (
    innerPages: number
): Promise<CoverDimensions> => {
    if (gelatoDryRun) return estimateCover(innerPages);
    const res = await call<Record<string, never>>(
        `https://product.gelatoapis.com/v3/products/${env.GELATO_PRODUCT_UID}/cover-dimensions?pageCount=${innerPages}`
    );
    return parseGelatoCover(res);
};

export type ShippingAddress = {
    name: string;
    line1: string;
    line2?: string | null;
    postalCode: string;
    city: string;
    country: "CH";
};

/** Stripe's shipping_details → our address (null if it isn't Swiss). */
export const fromStripeShipping = (
    s: Record<string, unknown> | null
): ShippingAddress | null => {
    const a = (s?.address ?? {}) as Record<string, string | null>;
    if (!s || a.country !== "CH") return null;
    return {
        name: String(s.name ?? ""),
        line1: a.line1 ?? "",
        line2: a.line2 ?? null,
        postalCode: a.postal_code ?? "",
        city: a.city ?? "",
        country: "CH",
    };
};

export const createGelatoOrder = async (o: {
    printId: string;
    email: string;
    pdfUrl: string;
    innerPages: number;
    address: ShippingAddress;
}) => {
    const [firstName, ...rest] = o.address.name.trim().split(/\s+/);
    const body = {
        orderType: env.GELATO_ORDER_TYPE,
        orderReferenceId: o.printId,
        customerReferenceId: o.email,
        currency: "CHF",
        items: [
            {
                itemReferenceId: `${o.printId}-1`,
                productUid: env.GELATO_PRODUCT_UID,
                pageCount: o.innerPages,
                files: [{ type: "default", url: o.pdfUrl }],
                quantity: 1,
            },
        ],
        shippingAddress: {
            firstName: firstName ?? "",
            lastName: rest.join(" ") || firstName || "",
            addressLine1: o.address.line1,
            addressLine2: o.address.line2 ?? "",
            city: o.address.city,
            postCode: o.address.postalCode,
            country: "CH",
            email: o.email,
        },
    };

    if (gelatoDryRun) {
        console.log(
            "\n🖨️  [Gelato dry run] would create this order:\n" +
                JSON.stringify(body, null, 2) +
                "\n"
        );
        return { id: `dryrun_${o.printId}` };
    }

    return call<{ id: string }>("https://order.gelatoapis.com/v4/orders", {
        method: "POST",
        body: JSON.stringify(body),
    });
};
