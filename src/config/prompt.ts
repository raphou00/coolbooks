export const createPrompt = (topic: string) => `
Create a kid book of 10 pages about the following topic: ${topic} in the following JSON format:
{
    "title": "STRING",
    "cover": "PROMPT",
    "pages": [
        {
            "image": "PROMPT",
            "text": "STRING" // about 5 phrases
        }
    ]
}

return only the JSON without any other text
`
