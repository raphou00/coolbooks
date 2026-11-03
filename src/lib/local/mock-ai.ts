import sharp from "sharp";

/**
 * Stand-in for the OpenRouter client used by book-creator, so a whole book
 * can be "generated" locally in seconds and for free. Same call shapes as
 * the real client: `responses.parse` (story plan) and
 * `chat.completions.create` (images as data URLs).
 */

const STORIES: Record<string, { title: string; pages: string[] }> = {
    de: {
        title: "{name} und der Sternenwald",
        pages: [
            "{name} entdeckt hinter dem Haus einen Pfad, der im Abendlicht glitzert.",
            "Ein kleines Murmeltier winkt und flüstert: «Komm mit, der Wald wartet!»",
        ],
    },
    fr: {
        title: "{name} et la forêt des étoiles",
        pages: [
            "{name} découvre derrière la maison un sentier qui scintille au coucher du soleil.",
            "Une petite marmotte fait signe et chuchote : « Viens, la forêt t'attend ! »",
        ],
    },
    it: {
        title: "{name} e il bosco delle stelle",
        pages: [
            "{name} scopre dietro casa un sentiero che brilla alla luce della sera.",
            "Una piccola marmotta saluta e sussurra: «Vieni, il bosco ti aspetta!»",
        ],
    },
    en: {
        title: "{name} and the Star Forest",
        pages: [
            "{name} finds a path behind the house that sparkles in the evening light.",
            'A little marmot waves and whispers: "Come along, the forest is waiting!"',
        ],
    },
};

const COLORS = [
    ["#FFB4A2", "#B5E48C"],
    ["#A0C4FF", "#FFD6A5"],
    ["#CDB4DB", "#BDE0FE"],
    ["#FDFFB6", "#9BF6FF"],
];

const escapeXml = (s: string) =>
    s.replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** A 2048 px placeholder picture with the scene written on it. */
const placeholder = async (label: string, seed: number) => {
    const [a, b] = COLORS[seed % COLORS.length];
    const words = escapeXml(label).split(/\s+/);
    const lines: string[] = [];
    for (const w of words) {
        const last = lines[lines.length - 1];
        if (last && (last + " " + w).length < 34)
            lines[lines.length - 1] += " " + w;
        else lines.push(w);
    }
    const text = lines
        .slice(0, 8)
        .map(
            (l, i) =>
                `<text x="1024" y="${820 + i * 90}" font-size="64" text-anchor="middle" font-family="sans-serif" fill="#333">${l}</text>`
        )
        .join("");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="2048" height="2048" fill="url(#g)"/>
<circle cx="1024" cy="520" r="220" fill="#fff" opacity="0.6"/>
<text x="1024" y="580" font-size="160" text-anchor="middle" font-family="sans-serif" fill="#555">MOCK</text>
${text}
</svg>`;
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
};

let counter = 0;

export const mockOpenAI = {
    responses: {
        parse: async ({ input }: { input: { content: string }[] }) => {
            const prompt = input[0]?.content ?? "";
            const name =
                /Main character: (.+)/.exec(prompt)?.[1]?.trim() ?? "Lina";
            const locale =
                /written in (German|French|Italian|English)/.exec(
                    prompt
                )?.[1] ?? "English";
            const lang = (
                {
                    German: "de",
                    French: "fr",
                    Italian: "it",
                    English: "en",
                } as Record<string, string>
            )[locale];
            const story = STORIES[lang] ?? STORIES.en;
            const fill = (s: string) => s.replaceAll("{name}", name);
            const pages = Array.from({ length: 12 }, (_, i) => ({
                text: `${fill(story.pages[i % story.pages.length])} (${i + 1}/12)`,
                image: `Scene ${i + 1}: ${name} exploring a starry forest with a friendly marmot`,
            }));
            return {
                output_parsed: {
                    title: fill(story.title),
                    character: `${name}, a cheerful child in a yellow raincoat`,
                    cover: `${name} at the edge of a glowing forest`,
                    pages,
                },
            };
        },
    },
    chat: {
        completions: {
            create: async ({
                messages,
            }: {
                messages: { content: { type: string; text?: string }[] }[];
            }) => {
                const prompt = messages[0]?.content?.[0]?.text ?? "";
                const scene =
                    /Scene: (.+)/.exec(prompt)?.[1]?.trim() ?? "Illustration";
                // A short pause so the UI's "drawing…" states are visible.
                await new Promise((r) => setTimeout(r, 300));
                const url = await placeholder(scene, counter++);
                return {
                    choices: [
                        { message: { images: [{ image_url: { url } }] } },
                    ],
                };
            },
        },
    },
};
