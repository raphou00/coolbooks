export const createPrompt = (topic: string, lang: string) => `
Create a kid book of 10 pages about the following topic: ${topic} in the following JSON format:
{
    "title": "STRING",
    "cover": "PROMPT",  // always in english
    "pages": [
        {
            "image": "PROMPT", // always in english
            "text": "STRING" // about 5 phrases
        }
    ]
}

the text of the page and the title must be in the following language: ${lang}
return only the JSON without any other text
`;
