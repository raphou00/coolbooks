import type {
    Adapter,
    DatabaseSession,
    DatabaseUser,
    RegisteredDatabaseSessionAttributes,
    RegisteredDatabaseUserAttributes,
} from "lucia";
import db, { type Session, type User } from "@/lib/db";

const toDatabaseSession = (s: Session): DatabaseSession => ({
    id: s.id,
    userId: s.userId,
    expiresAt: s.expiresAt,
    attributes: {
        ip: s.ip ?? undefined,
        browser: s.browser ?? undefined,
        os: s.os ?? undefined,
    } as RegisteredDatabaseSessionAttributes,
});

const toDatabaseUser = (u: User): DatabaseUser => ({
    id: u.id,
    attributes: {
        id: u.id,
        name: u.name,
        email: u.email,
        locale: u.locale,
        role: u.role,
        googleId: u.googleId ?? undefined,
        stripeCustomerId: u.stripeCustomerId ?? undefined,
    } as RegisteredDatabaseUserAttributes,
});

/**
 * Lucia adapter for the DynamoDB data table. Expired sessions are removed
 * by DynamoDB's TTL, so `deleteExpiredSessions` has nothing to do.
 */
export class DynamoDBAdapter implements Adapter {
    async getSessionAndUser(
        sessionId: string
    ): Promise<[DatabaseSession | null, DatabaseUser | null]> {
        const session = await db.sessions.get(sessionId);
        if (!session) return [null, null];
        const user = await db.users.get(session.userId);
        if (!user) return [null, null];
        return [toDatabaseSession(session), toDatabaseUser(user)];
    }

    async getUserSessions(userId: string): Promise<DatabaseSession[]> {
        return (await db.sessions.byUser(userId)).map(toDatabaseSession);
    }

    async setSession(session: DatabaseSession): Promise<void> {
        const attrs = session.attributes as {
            ip?: string;
            browser?: string;
            os?: string;
        };
        await db.sessions.put({
            id: session.id,
            userId: session.userId,
            expiresAt: session.expiresAt,
            ip: attrs.ip ?? null,
            browser: attrs.browser ?? null,
            os: attrs.os ?? null,
        });
    }

    async updateSessionExpiration(
        sessionId: string,
        expiresAt: Date
    ): Promise<void> {
        await db.sessions.updateExpiration(sessionId, expiresAt);
    }

    async deleteSession(sessionId: string): Promise<void> {
        await db.sessions.delete(sessionId);
    }

    async deleteUserSessions(userId: string): Promise<void> {
        await db.sessions.deleteByUser(userId);
    }

    async deleteExpiredSessions(): Promise<void> {
        // Handled by the table's TTL.
    }
}
