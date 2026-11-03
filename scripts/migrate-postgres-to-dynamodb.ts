/**
 * One-off migration: copy everything from the old Postgres database into the
 * DynamoDB data table, in the same item format as src/lib/db.
 *
 *   DATABASE_URL=postgres://… bun run db:migrate --dry-run   # report only
 *   DATABASE_URL=postgres://… bun run db:migrate             # write
 *
 * Needs DATA_DYNAMODB_TABLE and AWS credentials (or DYNAMODB_ENDPOINT for
 * DynamoDB Local). Safe to re-run: items are overwritten, never duplicated.
 * Expired sessions and reset tokens are skipped.
 */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    BatchWriteCommand,
    DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import { Pool } from "pg";

const dryRun = process.argv.includes("--dry-run");
const {
    DATABASE_URL,
    DATA_DYNAMODB_TABLE: TableName,
    DYNAMODB_ENDPOINT,
} = process.env;
if (!DATABASE_URL || !TableName) {
    console.error("DATABASE_URL and DATA_DYNAMODB_TABLE are required.");
    process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const ddb = DynamoDBDocumentClient.from(
    new DynamoDBClient({
        region: process.env.AWS_REGION,
        ...(DYNAMODB_ENDPOINT ? { endpoint: DYNAMODB_ENDPOINT } : {}),
    }),
    { marshallOptions: { removeUndefinedValues: true } }
);

type Row = Record<string, unknown>;
const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null);
const epoch = (v: unknown) =>
    Math.floor(new Date(v as string).getTime() / 1000);
const nowEpoch = Math.floor(Date.now() / 1000);

const rows = async (table: string): Promise<Row[]> => {
    const exists = await pool.query(`SELECT to_regclass($1) AS t`, [
        `public."${table}"`,
    ]);
    if (!exists.rows[0].t) return [];
    return (await pool.query(`SELECT * FROM "${table}"`)).rows;
};

const items: Row[] = [];
const report: Record<string, number> = {};
const count = (k: string) => (report[k] = (report[k] ?? 0) + 1);

/* ---------- users (+ unique guards) ---------- */
const seenEmails = new Map<string, string>();
for (const u of await rows("User")) {
    const email = String(u.email).trim();
    const emailKey = email.toLowerCase();
    if (seenEmails.has(emailKey)) {
        console.warn(
            `! Skipping user ${u.id}: email ${email} already used by ${seenEmails.get(emailKey)} (case-insensitive)`
        );
        count("users skipped (duplicate email)");
        continue;
    }
    seenEmails.set(emailKey, u.id as string);
    items.push({
        pk: `USER#${u.id}`,
        sk: "PROFILE",
        type: "User",
        id: u.id,
        name: u.name,
        email,
        password: u.password ?? null,
        role: u.role ?? "USER",
        locale: u.locale ?? "de",
        googleId: u.googleId ?? null,
        stripeCustomerId: u.stripeCustomerId ?? null,
        createdAt: iso(u.createdAt),
        updatedAt: iso(u.updatedAt),
    });
    items.push({ pk: `EMAIL#${emailKey}`, sk: "EMAIL", userId: u.id });
    if (u.googleId)
        items.push({ pk: `GOOGLE#${u.googleId}`, sk: "GOOGLE", userId: u.id });
    count("users");
}

/* ---------- sessions & tokens (only still valid) ---------- */
for (const s of await rows("Session")) {
    if (epoch(s.expiresAt) <= nowEpoch) {
        count("sessions skipped (expired)");
        continue;
    }
    items.push({
        pk: `SESSION#${s.id}`,
        sk: "SESSION",
        type: "Session",
        gsi1pk: `USER#${s.userId}`,
        gsi1sk: `SESSION#${s.id}`,
        id: s.id,
        userId: s.userId,
        ip: s.ip ?? null,
        browser: s.browser ?? null,
        os: s.os ?? null,
        expiresAt: iso(s.expiresAt),
        ttl: epoch(s.expiresAt),
        createdAt: iso(s.createdAt),
        updatedAt: iso(s.updatedAt),
    });
    count("sessions");
}
for (const t of await rows("Token")) {
    if (epoch(t.expiresAt) <= nowEpoch) {
        count("tokens skipped (expired)");
        continue;
    }
    items.push({
        pk: `TOKEN#${t.token}`,
        sk: "TOKEN",
        type: "Token",
        gsi1pk: `USER#${t.userId}`,
        gsi1sk: `TOKEN#${t.token}`,
        id: t.id,
        token: t.token,
        userId: t.userId,
        expiresAt: iso(t.expiresAt),
        ttl: epoch(t.expiresAt),
        createdAt: iso(t.createdAt),
    });
    count("tokens");
}

/* ---------- previews & orders (exist only if the order system was deployed) ---------- */
const orders = await rows("Order");
const orderByBook = new Map(
    orders
        .filter((o) => o.bookId)
        .map((o) => [o.bookId as string, o.id as string])
);
for (const p of await rows("Preview")) {
    items.push({
        pk: `PREVIEW#${p.id}`,
        sk: "PREVIEW",
        type: "Preview",
        id: p.id,
        topic: p.topic ?? {},
        plan: p.plan ?? null,
        title: p.title ?? null,
        cover: p.cover ?? null,
        ip: p.ip ?? null,
        createdAt: iso(p.createdAt),
        ttl: epoch(p.createdAt) + 30 * 86400,
    });
    count("previews");
}
for (const o of orders) {
    const updatedAt = iso(o.updatedAt)!;
    items.push({
        pk: `ORDER#${o.id}`,
        sk: "ORDER",
        type: "Order",
        gsi2pk: `ORDERS#${o.status}`,
        gsi2sk: updatedAt,
        id: o.id,
        status: o.status,
        product: o.product,
        email: o.email,
        locale: o.locale,
        amount: o.amount,
        currency: o.currency,
        stripeSessionId: o.stripeSessionId ?? null,
        paymentIntentId: o.paymentIntentId ?? null,
        previewId: o.previewId,
        userId: o.userId ?? null,
        bookId: o.bookId ?? null,
        dedication: o.dedication ?? null,
        giftTo: o.giftTo ?? null,
        giftFrom: o.giftFrom ?? null,
        shipping: o.shipping ?? null,
        attempts: o.attempts ?? 0,
        error: o.error ?? null,
        paidAt: iso(o.paidAt),
        deliveredAt: iso(o.deliveredAt),
        createdAt: iso(o.createdAt),
        updatedAt,
    });
    count("orders");
}

/* ---------- books & pages ---------- */
for (const b of await rows("Book")) {
    const createdAt = iso(b.createdAt)!;
    items.push({
        pk: `BOOK#${b.id}`,
        sk: "BOOK",
        type: "Book",
        ...(b.userId ?
            { gsi1pk: `USER#${b.userId}`, gsi1sk: `BOOK#${createdAt}` }
        :   {}),
        id: b.id,
        title: b.title,
        cover: b.cover,
        age: b.age ?? "",
        artStyle: b.artStyle ?? "",
        generating: Boolean(b.generating),
        dedication: b.dedication ?? null,
        redraws: b.redraws ?? 0,
        userId: b.userId ?? null,
        orderId: orderByBook.get(b.id as string) ?? null,
        plan: null,
        createdAt,
        updatedAt: iso(b.updatedAt),
    });
    count("books");
}
for (const p of await rows("Page")) {
    items.push({
        pk: `BOOK#${p.bookId}`,
        sk: `PAGE#${p.id}`,
        type: "Page",
        id: p.id,
        bookId: p.bookId,
        number: p.number ?? 0,
        text: p.text ?? "",
        image: p.image ?? "",
        color: p.color ?? "#ffffff",
        audio: p.audio ?? null,
    });
    count("pages");
}

console.table(report);

if (dryRun) {
    console.log(
        `Dry run: ${items.length} items would be written to ${TableName}.`
    );
} else {
    for (let i = 0; i < items.length; i += 25) {
        let RequestItems: Record<string, { PutRequest: { Item: Row } }[]> = {
            [TableName]: items
                .slice(i, i + 25)
                .map((Item) => ({ PutRequest: { Item } })),
        };
        while (RequestItems[TableName]?.length) {
            const res = await ddb.send(new BatchWriteCommand({ RequestItems }));
            RequestItems = (res.UnprocessedItems ?? {}) as typeof RequestItems;
        }
    }
    console.log(`✓ Wrote ${items.length} items to ${TableName}.`);
}

await pool.end();
