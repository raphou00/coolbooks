export type Role = "USER" | "ADMIN";
export type OrderStatus =
    "PENDING" | "PAID" | "GENERATING" | "DELIVERED" | "FAILED" | "REFUNDED";
export type Product = "PDF" | "PRINT";

export type User = {
    id: string;
    name: string;
    email: string;
    password: string | null;
    role: Role;
    locale: string;
    googleId: string | null;
    stripeCustomerId: string | null;
    createdAt: Date;
    updatedAt: Date;
};

export type Session = {
    id: string;
    userId: string;
    ip: string | null;
    browser: string | null;
    os: string | null;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
};

export type Token = {
    id: string;
    token: string;
    userId: string;
    expiresAt: Date;
    createdAt: Date;
};

/** Story plan from the generator, kept on the book so pages can be redrawn. */
export type StoryPlan = {
    title: string;
    character: string;
    cover: string;
    pages: { text: string; image: string }[];
};

export type Page = {
    id: string;
    bookId: string;
    number: number;
    text: string;
    image: string;
    color: string;
    audio: string | null;
    /** Earlier pictures of this page (before redraws), oldest first. */
    previousImages: string[];
};

export type Book = {
    id: string;
    title: string;
    cover: string;
    age: string;
    artStyle: string;
    generating: boolean;
    dedication: string | null;
    redraws: number;
    userId: string | null;
    orderId: string | null;
    plan: StoryPlan | null;
    createdAt: Date;
    updatedAt: Date;
};

export type BookWithPages = Book & { pages: Page[] };

export type Preview = {
    id: string;
    topic: Record<string, string>;
    plan: StoryPlan | null;
    title: string | null;
    cover: string | null;
    ip: string | null;
    createdAt: Date;
};

export type ShippingDetails = Record<string, unknown> | null;

export type Order = {
    id: string;
    status: OrderStatus;
    product: Product;
    email: string;
    locale: string;
    amount: number;
    currency: string;
    stripeSessionId: string | null;
    paymentIntentId: string | null;
    previewId: string;
    userId: string | null;
    bookId: string | null;
    dedication: string | null;
    giftTo: string | null;
    giftFrom: string | null;
    shipping: ShippingDetails;
    /** The print order, for hardcover orders once the book exists. */
    printId: string | null;
    attempts: number;
    error: string | null;
    paidAt: Date | null;
    deliveredAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export type PrintStatus =
    /** Paid and the book exists: waiting for the customer to check and confirm. */
    | "AWAITING_CONFIRMATION"
    /** Confirmed; the print file is being built and sent to Gelato. */
    | "SUBMITTING"
    /** Gelato accepted the order. */
    | "SUBMITTED"
    | "IN_PRODUCTION"
    | "SHIPPED"
    | "DELIVERED"
    /** Gelato refused it or it could not be sent; the print part is refunded. */
    | "FAILED"
    /** Never confirmed within 60 days; the print part is refunded. */
    | "CANCELED";

/** What gets printed, frozen when the customer confirms. */
export type PrintSnapshot = {
    title: string;
    cover: string;
    dedication: string | null;
    pages: { text: string; image: string; color: string; number: number }[];
};

export type PrintOrder = {
    id: string;
    status: PrintStatus;
    orderId: string;
    bookId: string;
    email: string;
    locale: string;
    /** Amount of the print part in cents, refunded if printing fails. */
    amount: number;
    shipping: ShippingDetails;
    snapshot: PrintSnapshot | null;
    pdfKey: string | null;
    innerPages: number | null;
    gelatoOrderId: string | null;
    trackingUrl: string | null;
    remindersSent: number;
    reviewToken: string;
    reviewEmailSentAt: Date | null;
    error: string | null;
    confirmedAt: Date | null;
    shippedAt: Date | null;
    deliveredAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};

export type Review = {
    id: string;
    printId: string;
    bookId: string;
    email: string;
    locale: string;
    rating: number;
    text: string;
    approved: boolean;
    promoCode: string;
    createdAt: Date;
};
