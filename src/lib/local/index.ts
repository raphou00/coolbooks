import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import env from "@/lib/env";

/**
 * Local mode helpers. Everything the cloud normally stores (S3 files, sent
 * emails) lives under `.local/` in the repo, which is git-ignored.
 */
export const isLocal = env.LOCAL_MODE;
export const mockPayments = isLocal && env.PAYMENTS === "mock";
export const mockAI = env.AI_MODE === "mock";

const root = path.join(process.cwd(), ".local");
export const filesDir = path.join(root, "files");
export const emailsDir = path.join(root, "emails");

/** Resolve a storage key inside a base dir, refusing `..` escapes. */
export const safeJoin = (base: string, key: string) => {
    const full = path.resolve(base, key);
    if (!full.startsWith(base + path.sep)) throw new Error("Bad key");
    return full;
};

export const writeLocalFile = async (key: string, body: Buffer) => {
    const full = safeJoin(filesDir, key);
    await mkdir(path.dirname(full), { recursive: true });
    await writeFile(full, body);
};

export const readLocalFile = (key: string) => readFile(safeJoin(filesDir, key));

export const deleteLocalPrefix = (prefix: string) =>
    rm(safeJoin(filesDir, prefix), { recursive: true, force: true });

export type LocalEmail = {
    id: string;
    to: string;
    subject: string;
    sentAt: string;
};

/** Save an email as HTML + a small JSON header instead of sending it. */
export const saveLocalEmail = async (
    to: string,
    subject: string,
    html: string,
    text: string
) => {
    await mkdir(emailsDir, { recursive: true });
    const sentAt = new Date().toISOString();
    const id = `${sentAt.replace(/[:.]/g, "-")}-${Math.random().toString(36).slice(2, 7)}`;
    const meta: LocalEmail = { id, to, subject, sentAt };
    await writeFile(path.join(emailsDir, `${id}.json`), JSON.stringify(meta));
    await writeFile(path.join(emailsDir, `${id}.html`), html);
    await writeFile(path.join(emailsDir, `${id}.txt`), text);
    console.log(
        `\n📧 [local inbox] to ${to}: "${subject}"\n   ${env.APP_URL}/api/dev/emails/${id}\n`
    );
    return id;
};

export const listLocalEmails = async (): Promise<LocalEmail[]> => {
    try {
        const names = await readdir(emailsDir);
        const metas = await Promise.all(
            names
                .filter((n) => n.endsWith(".json"))
                .map(async (n) =>
                    JSON.parse(await readFile(path.join(emailsDir, n), "utf8"))
                )
        );
        return metas.sort((a, b) => b.sentAt.localeCompare(a.sentAt));
    } catch {
        return [];
    }
};

export const readLocalEmail = (id: string) =>
    readFile(safeJoin(emailsDir, `${id}.html`), "utf8");
