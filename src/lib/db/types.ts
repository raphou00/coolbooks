export type Role = "USER" | "ADMIN";
export type OrderStatus =
    | "PENDING"
    | "PAID"
    | "GENERATING"
    | "DELIVERED"
    | "FAILED"
    | "REFUNDED";
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
    attempts: number;
    error: string | null;
    paidAt: Date | null;
    deliveredAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
};
