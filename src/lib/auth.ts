import { cache } from "react";
import { userAgent } from "next/server";
import { cookies, headers } from "next/headers";
import type { Role } from "@/lib/types";
import { PrismaAdapter } from "@lucia-auth/adapter-prisma";
import { Lucia, TimeSpan } from "lucia";
import { Google } from "arctic";
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
            locale: user.locale,
            role: user.role,
            googleId: user.googleId,
            stripeCustomerId: user.stripeCustomerId,
        };
    },
});

export const getUser = cache(async () => {
    const sessionId =
        (await cookies()).get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) return null;

    const { user, session } = await lucia.validateSession(sessionId);

    try {
        if (session && session.fresh) {
            const sessionCookie = lucia.createSessionCookie(session.id);
            (await cookies()).set(
                sessionCookie.name,
                sessionCookie.value,
                sessionCookie.attributes
            );
        }
        if (!session) {
            const sessionCookie = lucia.createBlankSessionCookie();
            (await cookies()).set(
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
    const h = await headers();
    const { browser, os } = userAgent({ headers: h });

    const visitorInfo = {
        ip: h.get("x-forwarded-for") || undefined,
        browser: browser.name,
        os: os.name,
    };

    const session = await lucia.createSession(userId, visitorInfo);
    const sessionCookie = lucia.createSessionCookie(session.id);
    (await cookies()).set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    );
};

export const google = new Google(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.APP_URL + "/api/auth/google/callback"
);

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
    locale: string;
    role: Role;
    googleId?: string;
    stripeCustomerId?: string;
};
