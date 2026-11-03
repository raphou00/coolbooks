/**
 * Single-table design for the Bibliboo data table.
 *
 *  Entity    pk                 sk             gsi1pk / gsi1sk              gsi2pk / gsi2sk
 *  ───────── ────────────────── ────────────── ──────────────────────────── ─────────────────────────
 *  User      USER#<id>          PROFILE
 *  Email     EMAIL#<email>      EMAIL          (unique guard → userId)
 *  Google    GOOGLE#<googleId>  GOOGLE         (unique guard → userId)
 *  Session   SESSION#<id>       SESSION        USER#<userId> / SESSION#<id>
 *  Token     TOKEN#<token>      TOKEN          USER#<userId> / TOKEN#<token>
 *  Book      BOOK#<id>          BOOK           USER#<userId> / BOOK#<createdAt>
 *  Page      BOOK#<bookId>      PAGE#<id>
 *  Preview   PREVIEW#<id>       PREVIEW
 *  Order     ORDER#<id>         ORDER                                       ORDERS#<status> / <updatedAt>
 *  Print     PRINT#<id>         PRINT                                       PRINTS#<status> / <updatedAt>
 *  Review    REVIEW#<printId>   REVIEW                                      REVIEWS#<approved> / <createdAt>
 *  ReviewKey REVIEWTOKEN#<tok>  REVIEWTOKEN    (→ printId)
 *  Budget    BUDGET#<yyyy-mm>   BUDGET         (AI spend this month: usd, calls)
 *
 * Sessions, tokens and previews carry a `ttl` (epoch seconds) so DynamoDB
 * deletes them on its own once they expire.
 *
 * Keep in sync with book-creator/index.js, which uses the same keys.
 */
export const keys = {
    user: (id: string) => ({ pk: `USER#${id}`, sk: "PROFILE" }),
    email: (email: string) => ({
        pk: `EMAIL#${email.trim().toLowerCase()}`,
        sk: "EMAIL",
    }),
    google: (googleId: string) => ({ pk: `GOOGLE#${googleId}`, sk: "GOOGLE" }),
    session: (id: string) => ({ pk: `SESSION#${id}`, sk: "SESSION" }),
    token: (token: string) => ({ pk: `TOKEN#${token}`, sk: "TOKEN" }),
    book: (id: string) => ({ pk: `BOOK#${id}`, sk: "BOOK" }),
    page: (bookId: string, pageId: string) => ({
        pk: `BOOK#${bookId}`,
        sk: `PAGE#${pageId}`,
    }),
    preview: (id: string) => ({ pk: `PREVIEW#${id}`, sk: "PREVIEW" }),
    order: (id: string) => ({ pk: `ORDER#${id}`, sk: "ORDER" }),
    userIndex: (userId: string) => `USER#${userId}`,
    orderStatusIndex: (status: string) => `ORDERS#${status}`,
    print: (id: string) => ({ pk: `PRINT#${id}`, sk: "PRINT" }),
    printStatusIndex: (status: string) => `PRINTS#${status}`,
    review: (printId: string) => ({ pk: `REVIEW#${printId}`, sk: "REVIEW" }),
    reviewIndex: (approved: boolean) => `REVIEWS#${approved ? "1" : "0"}`,
    reviewToken: (token: string) => ({
        pk: `REVIEWTOKEN#${token}`,
        sk: "REVIEWTOKEN",
    }),
    budget: (month: string) => ({ pk: `BUDGET#${month}`, sk: "BUDGET" }),
};

export const GSI1 = "gsi1";
export const GSI2 = "gsi2";

/** Previews are kept 30 days: long enough to come back and buy. */
export const PREVIEW_TTL_DAYS = 30;

export const toEpoch = (d: Date) => Math.floor(d.getTime() / 1000);
