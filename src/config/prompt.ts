import type { BookSchema } from "@/schema/book";

export const promptPlan = (topic: BookSchema) => `
Create a kid book of 10 pages using the following details:

-  Prompt/Topic: ${topic.prompt}
-  Main Character: ${topic.childName}, Age: ${topic.age}
-  Appearance: Hair Color: ${topic.hairColor}, Eye Color: ${topic.eyeColor}, Skin Tone: ${topic.skinTone}
-  Art Style: ${topic.artStyle}
-  Theme: ${topic.themes}
-  Setting: ${topic.setting}

Requirements:
* The title must be short and concise.
* Each page's text should be long enough to be interesting for the target age group.
* Describe the cover and each page's image in a detailed prompt, matching the specified art style, character appearance, theme, and setting.
* Be very precise with the image prompts to ensure the visuals match the description.

Output:
1. Title
2. Page-by-page story text (10 pages)
3. For each page (including the cover), a detailed image prompt reflecting all the above details.
`;

export const promptImage = (
    topic: string,
    artStyle: string,
    title?: string
) => `
generate an image of "${topic}, ${artStyle} style",
use the reference image as a base for character, background and style design
${title ? `include the title: ${title}` : "no text should be displayed on the image"}
`;
