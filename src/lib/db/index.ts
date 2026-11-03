import { randomUUID } from "node:crypto";
import {
    BatchGetCommand,
    BatchWriteCommand,
    DeleteCommand,
    GetCommand,
    PutCommand,
    QueryCommand,
    TransactWriteCommand,
    UpdateCommand,
    type QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import env from "@/lib/env";
import { ddb } from "@/lib/dynamo";
import { GSI1, GSI2, keys, PREVIEW_TTL_DAYS, toEpoch } from "./keys";
import type {
    Book,
    BookWithPages,
    Order,
    OrderStatus,
    Page,
    Preview,
    PrintOrder,
    PrintStatus,
    Review,
    Session,
    Token,
    User,
} from "./types";

export * from "./types";

const TableName = env.DATA_DYNAMODB_TABLE;

type Item = Record<string, unknown>;
type Key = { pk: string; sk: string };

/** Thrown when an email or Google account is already linked to a user. */
export class UniqueConstraintError extends Error {
    constructor(public field: "email" | "googleId") {
        super(`${field} already in use`);
    }
}

/* ---------- low-level helpers ---------- */

const now = () => new Date().toISOString();
const date = (v: unknown) => (v ? new Date(v as string) : null);

const getItem = async (key: Key) =>
    (await ddb.send(new GetCommand({ TableName, Key: key }))).Item ?? null;

const queryAll = async (input: Omit<QueryCommandInput, "TableName">) => {
    const items: Item[] = [];
    let ExclusiveStartKey: Record<string, unknown> | undefined;
    do {
        const res = await ddb.send(
            new QueryCommand({ TableName, ...input, ExclusiveStartKey })
        );
        items.push(...(res.Items ?? []));
        ExclusiveStartKey = res.LastEvaluatedKey;
    } while (ExclusiveStartKey);
    return items;
};

const deleteKeys = async (list: Key[]) => {
    for (let i = 0; i < list.length; i += 25) {
        let RequestItems: Record<string, { DeleteRequest: { Key: Key } }[]> = {
            [TableName]: list
                .slice(i, i + 25)
                .map((Key) => ({ DeleteRequest: { Key } })),
        };
        // Retry anything DynamoDB throttled.
        while (RequestItems[TableName]?.length) {
            const res = await ddb.send(new BatchWriteCommand({ RequestItems }));
            RequestItems = (res.UnprocessedItems ?? {}) as typeof RequestItems;
        }
    }
};

const keyOf = (i: Item): Key => ({ pk: i.pk as string, sk: i.sk as string });

/** SET every field in `patch` (Dates become ISO strings). */
const setExpression = (patch: Item) => {
    const names: Record<string, string> = {};
    const values: Record<string, unknown> = {};
    const sets = Object.entries(patch)
        .filter(([, v]) => v !== undefined)
        .map(([k, v], i) => {
            names[`#f${i}`] = k;
            values[`:v${i}`] = v instanceof Date ? v.toISOString() : v;
            return `#f${i} = :v${i}`;
        });
    return {
        UpdateExpression: `SET ${sets.join(", ")}`,
        ExpressionAttributeNames: names,
        ExpressionAttributeValues: values,
    };
};

const isConditionFailure = (err: unknown) =>
    err instanceof ConditionalCheckFailedException ||
    (err as Error)?.name === "ConditionalCheckFailedException";

/* ---------- mappers ---------- */

const toUser = (i: Item): User => ({
    id: i.id as string,
    name: i.name as string,
    email: i.email as string,
    password: (i.password as string) ?? null,
    role: (i.role as User["role"]) ?? "USER",
    locale: (i.locale as string) ?? "de",
    googleId: (i.googleId as string) ?? null,
    stripeCustomerId: (i.stripeCustomerId as string) ?? null,
    createdAt: date(i.createdAt)!,
    updatedAt: date(i.updatedAt)!,
});

const toSession = (i: Item): Session => ({
    id: i.id as string,
    userId: i.userId as string,
    ip: (i.ip as string) ?? null,
    browser: (i.browser as string) ?? null,
    os: (i.os as string) ?? null,
    expiresAt: date(i.expiresAt)!,
    createdAt: date(i.createdAt)!,
    updatedAt: date(i.updatedAt)!,
});

const toToken = (i: Item): Token => ({
    id: i.id as string,
    token: i.token as string,
    userId: i.userId as string,
    expiresAt: date(i.expiresAt)!,
    createdAt: date(i.createdAt)!,
});

const toBook = (i: Item): Book => ({
    id: i.id as string,
    title: i.title as string,
    cover: i.cover as string,
    age: (i.age as string) ?? "",
    artStyle: (i.artStyle as string) ?? "",
    generating: Boolean(i.generating),
    dedication: (i.dedication as string) ?? null,
    redraws: (i.redraws as number) ?? 0,
    userId: (i.userId as string) ?? null,
    orderId: (i.orderId as string) ?? null,
    plan: (i.plan as Book["plan"]) ?? null,
    createdAt: date(i.createdAt)!,
    updatedAt: date(i.updatedAt)!,
});

const toPage = (i: Item): Page => ({
    id: i.id as string,
    bookId: i.bookId as string,
    number: (i.number as number) ?? 0,
    text: (i.text as string) ?? "",
    image: (i.image as string) ?? "",
    color: (i.color as string) ?? "#ffffff",
    audio: (i.audio as string) ?? null,
    previousImages: (i.previousImages as string[]) ?? [],
});

const toPreview = (i: Item): Preview => ({
    id: i.id as string,
    topic: (i.topic as Preview["topic"]) ?? {},
    plan: (i.plan as Preview["plan"]) ?? null,
    title: (i.title as string) ?? null,
    cover: (i.cover as string) ?? null,
    ip: (i.ip as string) ?? null,
    createdAt: date(i.createdAt)!,
});

const toOrder = (i: Item): Order => ({
    id: i.id as string,
    status: i.status as OrderStatus,
    product: (i.product as Order["product"]) ?? "PDF",
    email: i.email as string,
    locale: (i.locale as string) ?? "de",
    amount: i.amount as number,
    currency: i.currency as string,
    stripeSessionId: (i.stripeSessionId as string) ?? null,
    paymentIntentId: (i.paymentIntentId as string) ?? null,
    previewId: i.previewId as string,
    userId: (i.userId as string) ?? null,
    bookId: (i.bookId as string) ?? null,
    dedication: (i.dedication as string) ?? null,
    giftTo: (i.giftTo as string) ?? null,
    giftFrom: (i.giftFrom as string) ?? null,
    shipping: (i.shipping as Order["shipping"]) ?? null,
    printId: (i.printId as string) ?? null,
    attempts: (i.attempts as number) ?? 0,
    error: (i.error as string) ?? null,
    paidAt: date(i.paidAt),
    deliveredAt: date(i.deliveredAt),
    createdAt: date(i.createdAt)!,
    updatedAt: date(i.updatedAt)!,
});

/* ---------- users ---------- */

type NewUser = {
    id?: string;
    name: string;
    email: string;
    password?: string | null;
    googleId?: string | null;
    locale?: string;
    role?: User["role"];
    stripeCustomerId?: string | null;
    createdAt?: string;
};

type UserPatch = Partial<
    Pick<
        User,
        | "name"
        | "email"
        | "password"
        | "locale"
        | "googleId"
        | "stripeCustomerId"
        | "role"
    >
>;

const users = {
    get: async (id: string) => {
        const i = await getItem(keys.user(id));
        return i ? toUser(i) : null;
    },

    byEmail: async (email: string) => {
        const guard = await getItem(keys.email(email));
        return guard ? users.get(guard.userId as string) : null;
    },

    byGoogleId: async (googleId: string) => {
        const guard = await getItem(keys.google(googleId));
        return guard ? users.get(guard.userId as string) : null;
    },

    /** Create a user; email and Google ID stay unique via guard items. */
    create: async (data: NewUser) => {
        const id = data.id ?? randomUUID();
        const ts = data.createdAt ?? now();
        const item = {
            ...keys.user(id),
            type: "User",
            id,
            name: data.name,
            email: data.email.trim(),
            password: data.password ?? null,
            role: data.role ?? "USER",
            locale: data.locale ?? "de",
            googleId: data.googleId ?? null,
            stripeCustomerId: data.stripeCustomerId ?? null,
            createdAt: ts,
            updatedAt: ts,
        };

        const TransactItems = [
            {
                Put: {
                    TableName,
                    Item: item,
                    ConditionExpression: "attribute_not_exists(pk)",
                },
            },
            {
                Put: {
                    TableName,
                    Item: { ...keys.email(data.email), userId: id },
                    ConditionExpression: "attribute_not_exists(pk)",
                },
            },
            ...(data.googleId ?
                [
                    {
                        Put: {
                            TableName,
                            Item: { ...keys.google(data.googleId), userId: id },
                            ConditionExpression: "attribute_not_exists(pk)",
                        },
                    },
                ]
            :   []),
        ];

        try {
            await ddb.send(new TransactWriteCommand({ TransactItems }));
        } catch (err) {
            if ((err as Error).name === "TransactionCanceledException") {
                const reasons = (
                    err as { CancellationReasons?: { Code?: string }[] }
                ).CancellationReasons;
                throw new UniqueConstraintError(
                    reasons?.[2]?.Code === "ConditionalCheckFailed" ?
                        "googleId"
                    :   "email"
                );
            }
            throw err;
        }
        return toUser(item);
    },

    /** Update a user, moving the email/Google guards when those change. */
    update: async (id: string, patch: UserPatch) => {
        const current = await users.get(id);
        if (!current) throw new Error(`User ${id} not found`);

        const fields: Item = { ...patch, updatedAt: now() };
        if (patch.email !== undefined) fields.email = patch.email.trim();

        const TransactItems: object[] = [
            {
                Update: {
                    TableName,
                    Key: keys.user(id),
                    ...setExpression(fields),
                },
            },
        ];

        const emailChanged =
            patch.email !== undefined &&
            keys.email(patch.email).pk !== keys.email(current.email).pk;
        if (emailChanged) {
            TransactItems.push(
                { Delete: { TableName, Key: keys.email(current.email) } },
                {
                    Put: {
                        TableName,
                        Item: { ...keys.email(patch.email!), userId: id },
                        ConditionExpression: "attribute_not_exists(pk)",
                    },
                }
            );
        }

        const googleChanged =
            patch.googleId !== undefined && patch.googleId !== current.googleId;
        if (googleChanged) {
            if (current.googleId) {
                TransactItems.push({
                    Delete: { TableName, Key: keys.google(current.googleId) },
                });
            }
            if (patch.googleId) {
                TransactItems.push({
                    Put: {
                        TableName,
                        Item: { ...keys.google(patch.googleId), userId: id },
                        ConditionExpression: "attribute_not_exists(pk)",
                    },
                });
            }
        }

        try {
            await ddb.send(
                new TransactWriteCommand({
                    TransactItems: TransactItems as never,
                })
            );
        } catch (err) {
            if ((err as Error).name === "TransactionCanceledException") {
                throw new UniqueConstraintError(
                    emailChanged ? "email" : "googleId"
                );
            }
            throw err;
        }
    },

    /** Delete a user with their sessions, tokens and books. Orders are kept. */
    delete: async (id: string) => {
        const user = await users.get(id);
        if (!user) return;

        const owned = await queryAll({
            IndexName: GSI1,
            KeyConditionExpression: "gsi1pk = :u",
            ExpressionAttributeValues: { ":u": keys.userIndex(id) },
        });

        const bookIds = owned
            .filter((i) => String(i.gsi1sk).startsWith("BOOK#"))
            .map((i) => i.id as string);
        for (const bookId of bookIds) await books.delete(bookId);

        await deleteKeys([
            ...owned
                .filter((i) => !String(i.gsi1sk).startsWith("BOOK#"))
                .map(keyOf),
            keys.user(id),
            keys.email(user.email),
            ...(user.googleId ? [keys.google(user.googleId)] : []),
        ]);
    },
};

/* ---------- sessions (used by the Lucia adapter) ---------- */

const sessions = {
    get: async (id: string) => {
        const i = await getItem(keys.session(id));
        return i ? toSession(i) : null;
    },

    byUser: async (userId: string) =>
        (
            await queryAll({
                IndexName: GSI1,
                KeyConditionExpression:
                    "gsi1pk = :u AND begins_with(gsi1sk, :s)",
                ExpressionAttributeValues: {
                    ":u": keys.userIndex(userId),
                    ":s": "SESSION#",
                },
            })
        ).map(toSession),

    put: async (s: Omit<Session, "createdAt" | "updatedAt">) => {
        const ts = now();
        await ddb.send(
            new PutCommand({
                TableName,
                Item: {
                    ...keys.session(s.id),
                    type: "Session",
                    gsi1pk: keys.userIndex(s.userId),
                    gsi1sk: `SESSION#${s.id}`,
                    ...s,
                    expiresAt: s.expiresAt.toISOString(),
                    ttl: toEpoch(s.expiresAt),
                    createdAt: ts,
                    updatedAt: ts,
                },
            })
        );
    },

    updateExpiration: async (id: string, expiresAt: Date) => {
        try {
            await ddb.send(
                new UpdateCommand({
                    TableName,
                    Key: keys.session(id),
                    ConditionExpression: "attribute_exists(pk)",
                    ...setExpression({
                        expiresAt,
                        ttl: toEpoch(expiresAt),
                        updatedAt: now(),
                    }),
                })
            );
        } catch (err) {
            if (!isConditionFailure(err)) throw err;
        }
    },

    delete: async (id: string) => {
        await ddb.send(new DeleteCommand({ TableName, Key: keys.session(id) }));
    },

    /** Delete one session only if it belongs to `userId`. */
    deleteForUser: async (userId: string, id: string) => {
        try {
            await ddb.send(
                new DeleteCommand({
                    TableName,
                    Key: keys.session(id),
                    ConditionExpression: "userId = :u",
                    ExpressionAttributeValues: { ":u": userId },
                })
            );
            return true;
        } catch (err) {
            if (isConditionFailure(err)) return false;
            throw err;
        }
    },

    deleteByUser: async (userId: string) => {
        const list = await sessions.byUser(userId);
        await deleteKeys(list.map((s) => keys.session(s.id)));
    },
};

/* ---------- password-reset tokens ---------- */

const tokens = {
    create: async (data: {
        userId: string;
        token: string;
        expiresAt: Date;
    }) => {
        await ddb.send(
            new PutCommand({
                TableName,
                Item: {
                    ...keys.token(data.token),
                    type: "Token",
                    gsi1pk: keys.userIndex(data.userId),
                    gsi1sk: `TOKEN#${data.token}`,
                    id: randomUUID(),
                    token: data.token,
                    userId: data.userId,
                    expiresAt: data.expiresAt.toISOString(),
                    ttl: toEpoch(data.expiresAt),
                    createdAt: now(),
                },
            })
        );
    },

    byToken: async (token: string) => {
        const i = await getItem(keys.token(token));
        return i ? toToken(i) : null;
    },

    delete: async (token: string) => {
        await ddb.send(
            new DeleteCommand({ TableName, Key: keys.token(token) })
        );
    },

    deleteByUser: async (userId: string) => {
        const items = await queryAll({
            IndexName: GSI1,
            KeyConditionExpression: "gsi1pk = :u AND begins_with(gsi1sk, :t)",
            ExpressionAttributeValues: {
                ":u": keys.userIndex(userId),
                ":t": "TOKEN#",
            },
        });
        await deleteKeys(items.map(keyOf));
    },
};

/* ---------- books & pages ---------- */

const books = {
    get: async (id: string) => {
        const i = await getItem(keys.book(id));
        return i ? toBook(i) : null;
    },

    /** The book and all its pages in one query (same partition). */
    getWithPages: async (id: string): Promise<BookWithPages | null> => {
        const items = await queryAll({
            KeyConditionExpression: "pk = :b",
            ExpressionAttributeValues: { ":b": keys.book(id).pk },
            ConsistentRead: true,
        });
        const bookItem = items.find((i) => i.sk === "BOOK");
        if (!bookItem) return null;
        const pages = items
            .filter((i) => String(i.sk).startsWith("PAGE#"))
            .map(toPage)
            .sort((a, b) => a.number - b.number);
        return { ...toBook(bookItem), pages };
    },

    /** Several books by id, returned in the order asked. */
    byIds: async (ids: string[]) => {
        if (ids.length === 0) return [];
        const found: Item[] = [];
        for (let i = 0; i < ids.length; i += 100) {
            let RequestItems: Record<string, { Keys: Key[] }> = {
                [TableName]: { Keys: ids.slice(i, i + 100).map(keys.book) },
            };
            while (RequestItems[TableName]?.Keys.length) {
                const res = await ddb.send(
                    new BatchGetCommand({ RequestItems })
                );
                found.push(...(res.Responses?.[TableName] ?? []));
                RequestItems = (res.UnprocessedKeys ??
                    {}) as typeof RequestItems;
            }
        }
        const byId = new Map(found.map((i) => [i.id as string, toBook(i)]));
        return ids.map((id) => byId.get(id)).filter((b): b is Book => !!b);
    },

    /** A user's books, newest first. */
    byUser: async (userId: string) =>
        (
            await queryAll({
                IndexName: GSI1,
                KeyConditionExpression:
                    "gsi1pk = :u AND begins_with(gsi1sk, :b)",
                ExpressionAttributeValues: {
                    ":u": keys.userIndex(userId),
                    ":b": "BOOK#",
                },
                ScanIndexForward: false,
            })
        ).map(toBook),

    /** Take one free redraw if any are left. Returns false at the limit. */
    reserveRedraw: async (id: string, max: number) => {
        try {
            await ddb.send(
                new UpdateCommand({
                    TableName,
                    Key: keys.book(id),
                    UpdateExpression:
                        "SET redraws = if_not_exists(redraws, :zero) + :one, updatedAt = :now",
                    ConditionExpression:
                        "attribute_exists(pk) AND (attribute_not_exists(redraws) OR redraws < :max)",
                    ExpressionAttributeValues: {
                        ":zero": 0,
                        ":one": 1,
                        ":max": max,
                        ":now": now(),
                    },
                })
            );
            return true;
        } catch (err) {
            if (isConditionFailure(err)) return false;
            throw err;
        }
    },

    releaseRedraw: async (id: string) => {
        await ddb
            .send(
                new UpdateCommand({
                    TableName,
                    Key: keys.book(id),
                    UpdateExpression: "SET redraws = redraws - :one",
                    ConditionExpression: "redraws > :zero",
                    ExpressionAttributeValues: { ":one": 1, ":zero": 0 },
                })
            )
            .catch(() => undefined);
    },

    /** Delete a book and all its pages. */
    delete: async (id: string) => {
        const items = await queryAll({
            KeyConditionExpression: "pk = :b",
            ExpressionAttributeValues: { ":b": keys.book(id).pk },
            ProjectionExpression: "pk, sk",
        });
        await deleteKeys(items.map(keyOf));
    },

    getPage: async (bookId: string, pageId: string) => {
        const i = await getItem(keys.page(bookId, pageId));
        return i ? toPage(i) : null;
    },

    /** Editor: title and dedication. */
    update: async (
        id: string,
        patch: { title?: string; dedication?: string | null }
    ) => {
        await ddb.send(
            new UpdateCommand({
                TableName,
                Key: keys.book(id),
                ConditionExpression: "attribute_exists(pk)",
                ...setExpression({ ...patch, updatedAt: now() }),
            })
        );
    },

    /**
     * Editor: page text, colour or picture. Changing the text drops the
     * cached read-aloud audio so it is spoken again.
     */
    updatePage: async (
        bookId: string,
        pageId: string,
        patch: { text?: string; color?: string; image?: string }
    ) => {
        await ddb.send(
            new UpdateCommand({
                TableName,
                Key: keys.page(bookId, pageId),
                ConditionExpression: "attribute_exists(pk)",
                ...setExpression({
                    ...patch,
                    ...(patch.text !== undefined ? { audio: null } : {}),
                }),
            })
        );
    },

    setPageAudio: async (bookId: string, pageId: string, audio: string) => {
        await ddb.send(
            new UpdateCommand({
                TableName,
                Key: keys.page(bookId, pageId),
                ConditionExpression: "attribute_exists(pk)",
                ...setExpression({ audio }),
            })
        );
    },
};

/* ---------- previews ---------- */

const previews = {
    create: async (data: {
        topic: Record<string, string>;
        ip: string | null;
    }) => {
        const id = randomUUID();
        const createdAt = new Date();
        const expires = new Date(
            createdAt.getTime() + PREVIEW_TTL_DAYS * 86_400_000
        );
        const item = {
            ...keys.preview(id),
            type: "Preview",
            id,
            topic: data.topic,
            ip: data.ip,
            plan: null,
            title: null,
            cover: null,
            createdAt: createdAt.toISOString(),
            ttl: toEpoch(expires),
        };
        await ddb.send(new PutCommand({ TableName, Item: item }));
        return toPreview(item);
    },

    get: async (id: string) => {
        const i = await getItem(keys.preview(id));
        return i ? toPreview(i) : null;
    },
};

/* ---------- orders ---------- */

type NewOrder = Pick<
    Order,
    | "product"
    | "email"
    | "locale"
    | "amount"
    | "currency"
    | "previewId"
    | "userId"
    | "dedication"
    | "giftTo"
    | "giftFrom"
>;

type OrderPatch = Partial<Omit<Order, "id" | "createdAt" | "updatedAt">>;

/** Fields kept in sync with the status index on every write. */
const orderIndex = (status: OrderStatus | undefined, updatedAt: string) => ({
    ...(status ? { status, gsi2pk: keys.orderStatusIndex(status) } : {}),
    gsi2sk: updatedAt,
    updatedAt,
});

const orders = {
    create: async (data: NewOrder) => {
        const id = randomUUID();
        const ts = now();
        const item = {
            ...keys.order(id),
            type: "Order",
            id,
            ...data,
            stripeSessionId: null,
            paymentIntentId: null,
            bookId: null,
            shipping: null,
            attempts: 0,
            error: null,
            paidAt: null,
            deliveredAt: null,
            createdAt: ts,
            ...orderIndex("PENDING", ts),
        };
        await ddb.send(
            new PutCommand({
                TableName,
                Item: item,
                ConditionExpression: "attribute_not_exists(pk)",
            })
        );
        return toOrder(item);
    },

    get: async (id: string) => {
        const i = await getItem(keys.order(id));
        return i ? toOrder(i) : null;
    },

    update: async (id: string, patch: OrderPatch) => {
        await ddb.send(
            new UpdateCommand({
                TableName,
                Key: keys.order(id),
                ConditionExpression: "attribute_exists(pk)",
                ...setExpression({
                    ...patch,
                    ...orderIndex(patch.status, now()),
                }),
            })
        );
    },

    /**
     * Change status only if the order is currently in one of `from`.
     * Returns false when another process got there first.
     */
    transition: async (
        id: string,
        from: OrderStatus[],
        patch: OrderPatch & { status: OrderStatus }
    ) => {
        const expr = setExpression({
            ...patch,
            ...orderIndex(patch.status, now()),
        });
        const fromValues = Object.fromEntries(
            from.map((s, i) => [`:from${i}`, s])
        );
        try {
            await ddb.send(
                new UpdateCommand({
                    TableName,
                    Key: keys.order(id),
                    ...expr,
                    ConditionExpression: `#st IN (${Object.keys(fromValues).join(", ")})`,
                    ExpressionAttributeNames: {
                        ...expr.ExpressionAttributeNames,
                        "#st": "status",
                    },
                    ExpressionAttributeValues: {
                        ...expr.ExpressionAttributeValues,
                        ...fromValues,
                    },
                })
            );
            return true;
        } catch (err) {
            if (isConditionFailure(err)) return false;
            throw err;
        }
    },

    /** Orders in `status` last touched before `before` (oldest first). */
    byStatus: async (status: OrderStatus, before: Date = new Date()) =>
        (
            await queryAll({
                IndexName: GSI2,
                KeyConditionExpression: "gsi2pk = :s AND gsi2sk < :t",
                ExpressionAttributeValues: {
                    ":s": keys.orderStatusIndex(status),
                    ":t": before.toISOString(),
                },
            })
        ).map(toOrder),
};

/* ---------- print orders ---------- */

const toPrint = (i: Item): PrintOrder => ({
    id: i.id as string,
    status: i.status as PrintStatus,
    orderId: i.orderId as string,
    bookId: i.bookId as string,
    email: i.email as string,
    locale: (i.locale as string) ?? "de",
    amount: (i.amount as number) ?? 0,
    shipping: (i.shipping as PrintOrder["shipping"]) ?? null,
    snapshot: (i.snapshot as PrintOrder["snapshot"]) ?? null,
    pdfKey: (i.pdfKey as string) ?? null,
    innerPages: (i.innerPages as number) ?? null,
    gelatoOrderId: (i.gelatoOrderId as string) ?? null,
    trackingUrl: (i.trackingUrl as string) ?? null,
    remindersSent: (i.remindersSent as number) ?? 0,
    reviewToken: i.reviewToken as string,
    reviewEmailSentAt: date(i.reviewEmailSentAt),
    error: (i.error as string) ?? null,
    confirmedAt: date(i.confirmedAt),
    shippedAt: date(i.shippedAt),
    deliveredAt: date(i.deliveredAt),
    createdAt: date(i.createdAt)!,
    updatedAt: date(i.updatedAt)!,
});

type PrintPatch = Partial<Omit<PrintOrder, "id" | "createdAt" | "updatedAt">>;

const printIndex = (status: PrintStatus | undefined, updatedAt: string) => ({
    ...(status ? { status, gsi2pk: keys.printStatusIndex(status) } : {}),
    gsi2sk: updatedAt,
    updatedAt,
});

const prints = {
    /** Create the print order for a paid order (once) and link it. */
    create: async (data: {
        orderId: string;
        bookId: string;
        email: string;
        locale: string;
        amount: number;
        shipping: PrintOrder["shipping"];
    }) => {
        const id = randomUUID();
        const ts = now();
        const reviewToken = randomUUID().replaceAll("-", "");
        const item = {
            ...keys.print(id),
            type: "Print",
            id,
            ...data,
            snapshot: null,
            pdfKey: null,
            innerPages: null,
            gelatoOrderId: null,
            trackingUrl: null,
            remindersSent: 0,
            reviewToken,
            reviewEmailSentAt: null,
            error: null,
            confirmedAt: null,
            shippedAt: null,
            deliveredAt: null,
            createdAt: ts,
            ...printIndex("AWAITING_CONFIRMATION", ts),
        };
        await ddb.send(
            new TransactWriteCommand({
                TransactItems: [
                    {
                        Put: {
                            TableName,
                            Item: item,
                            ConditionExpression: "attribute_not_exists(pk)",
                        },
                    },
                    {
                        Put: {
                            TableName,
                            Item: {
                                ...keys.reviewToken(reviewToken),
                                printId: id,
                            },
                        },
                    },
                    {
                        // One print order per order.
                        Update: {
                            TableName,
                            Key: keys.order(data.orderId),
                            UpdateExpression: "SET printId = :p",
                            ConditionExpression:
                                "attribute_not_exists(printId) OR printId = :null",
                            ExpressionAttributeValues: {
                                ":p": id,
                                ":null": null,
                            },
                        },
                    },
                ],
            })
        );
        return toPrint(item);
    },

    get: async (id: string) => {
        const i = await getItem(keys.print(id));
        return i ? toPrint(i) : null;
    },

    byReviewToken: async (token: string) => {
        const guard = await getItem(keys.reviewToken(token));
        return guard ? prints.get(guard.printId as string) : null;
    },

    update: async (id: string, patch: PrintPatch) => {
        await ddb.send(
            new UpdateCommand({
                TableName,
                Key: keys.print(id),
                ConditionExpression: "attribute_exists(pk)",
                ...setExpression({
                    ...patch,
                    ...printIndex(patch.status, now()),
                }),
            })
        );
    },

    /** Change status only from one of `from`; false if someone else did. */
    transition: async (
        id: string,
        from: PrintStatus[],
        patch: PrintPatch & { status: PrintStatus }
    ) => {
        const expr = setExpression({
            ...patch,
            ...printIndex(patch.status, now()),
        });
        const fromValues = Object.fromEntries(
            from.map((s, i) => [`:from${i}`, s])
        );
        try {
            await ddb.send(
                new UpdateCommand({
                    TableName,
                    Key: keys.print(id),
                    ...expr,
                    ConditionExpression: `#st IN (${Object.keys(fromValues).join(", ")})`,
                    ExpressionAttributeNames: {
                        ...expr.ExpressionAttributeNames,
                        "#st": "status",
                    },
                    ExpressionAttributeValues: {
                        ...expr.ExpressionAttributeValues,
                        ...fromValues,
                    },
                })
            );
            return true;
        } catch (err) {
            if (isConditionFailure(err)) return false;
            throw err;
        }
    },

    byStatus: async (status: PrintStatus, before: Date = new Date()) =>
        (
            await queryAll({
                IndexName: GSI2,
                KeyConditionExpression: "gsi2pk = :s AND gsi2sk < :t",
                ExpressionAttributeValues: {
                    ":s": keys.printStatusIndex(status),
                    ":t": before.toISOString(),
                },
            })
        ).map(toPrint),
};

/* ---------- reviews ---------- */

const toReview = (i: Item): Review => ({
    id: i.id as string,
    printId: i.printId as string,
    bookId: i.bookId as string,
    email: i.email as string,
    locale: (i.locale as string) ?? "de",
    rating: i.rating as number,
    text: (i.text as string) ?? "",
    approved: Boolean(i.approved),
    promoCode: (i.promoCode as string) ?? "",
    createdAt: date(i.createdAt)!,
});

const reviews = {
    get: async (printId: string) => {
        const i = await getItem(keys.review(printId));
        return i ? toReview(i) : null;
    },

    /** One review per print order; returns null if one already exists. */
    create: async (data: Omit<Review, "id" | "approved" | "createdAt">) => {
        const ts = now();
        const item = {
            ...keys.review(data.printId),
            type: "Review",
            id: data.printId,
            ...data,
            approved: false,
            createdAt: ts,
            gsi2pk: keys.reviewIndex(false),
            gsi2sk: ts,
        };
        try {
            await ddb.send(
                new PutCommand({
                    TableName,
                    Item: item,
                    ConditionExpression: "attribute_not_exists(pk)",
                })
            );
            return toReview(item);
        } catch (err) {
            if (isConditionFailure(err)) return null;
            throw err;
        }
    },

    setApproved: async (printId: string, approved: boolean) => {
        const r = await reviews.get(printId);
        if (!r) return;
        await ddb.send(
            new UpdateCommand({
                TableName,
                Key: keys.review(printId),
                ...setExpression({
                    approved,
                    gsi2pk: keys.reviewIndex(approved),
                }),
            })
        );
    },

    /** Newest first. */
    list: async (approved: boolean, limit = 50) =>
        (
            await ddb.send(
                new QueryCommand({
                    TableName,
                    IndexName: GSI2,
                    KeyConditionExpression: "gsi2pk = :s",
                    ExpressionAttributeValues: {
                        ":s": keys.reviewIndex(approved),
                    },
                    ScanIndexForward: false,
                    Limit: limit,
                })
            )
        ).Items?.map(toReview) ?? [],
};

const db = {
    users,
    sessions,
    tokens,
    books,
    previews,
    orders,
    prints,
    reviews,
};

export default db;
