import { cache } from "react";
import { userAgent } from "next/server";
import { cookies, headers } from "next/headers";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia, TimeSpan } from "lucia";
import db from "./db";
import env from "./env";

const adapter = new PrismaAdapter(db.session, db.user);

export const lucia = new Lucia(adapter, {
    sessionExpiresIn: new TimeSpan(12, "w"),
    sessionCookie: {
        name: "session",
        expires: true,
        attributes: {
            secure: env.NODE_ENV === "production",
        },
    },
    getUserAttributes: (user) => {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            emailVerified: user.emailVerified,
            creators: user.creators,
            currency: user.currency,
            locale: user.locale,
        };
    },
});

export const getUser = cache(async () => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) return null;

    const { user, session } = await lucia.validateSession(sessionId);

    try {
        if (session && session.fresh) {
            const sessionCookie = lucia.createSessionCookie(session.id);
            cookies().set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes
            );
        }
        if (!session) {
            const sessionCookie = lucia.createBlankSessionCookie();
            cookies().set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes
            );
        }
    } catch {
        // Next.js throws error when attempting to set cookies when rendering page
    }

    return { user, session };
});

export const createSession = async (userId: string) => {
    const h = headers();
    const { browser, os } = userAgent({ headers: h });

    const visitorInfo = {
        ip: h.get("x-forwarded-for") || undefined,
        browser: browser.name,
        os: os.name,
    };

    const session = await lucia.createSession(userId, visitorInfo);
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    );
};

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia;
        DatabaseSessionAttributes: DatabaseSessionAttributes;
        DatabaseUserAttributes: DatabaseUserAttributes;
    }
}

type DatabaseSessionAttributes = {
    ip?: string;
    browser?: string;
    os?: string;
};

type DatabaseUserAttributes = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    creators: string[];
    currency: string;
    locale: string;
};
