/**
 * Legal details for the Impressum (required in Switzerland, UWG art. 3 lit. s).
 * TODO before launch: replace every placeholder with your real details.
 * `uid` can stay empty until the business is registered.
 */
export const legal = {
    operator: "TODO: Full name or company name",
    street: "TODO: Street and number",
    city: "TODO: Postcode and town",
    country: "Schweiz / Suisse / Svizzera",
    email: "hello@bibliboo.ch",
    uid: "",
    responsible: "TODO: Full name",
};

/** True while placeholders remain, so the page can warn instead of lying. */
export const legalIsIncomplete = Object.values(legal).some((v) =>
    v.startsWith("TODO")
);
