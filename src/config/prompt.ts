export const promptPlan = (topic: string) => `
Create a kid book of 10 pages about the following topic: ${topic}
The title must be short and concise.
The text of the pages must be long enough to be interesting.
You must describe in a prompt the cover and images
Be very precise with the prompt of the images
`;

export const promptImage = (topic: string, title?: string) => `
generate an image of "${topic}, cartoon style",
use the reference image as a base for character, background and style design
${title ? `include the title: ${title}` : "no text should be displayed on the image"}
`;
