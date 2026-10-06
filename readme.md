# 📚 Coolbooks

> Personalized illustrated children's books, generated in about 2 minutes.

A parent describes their child (name, age, hair, eyes, skin tone), picks an art
style and writes a story idea. After paying, they get a 12-page illustrated book
starring their child, readable on the site and delivered as a PDF by email.

## How it works

```
Browser ──► Next.js app ──► Stripe Checkout
                                  │
                   checkout.session.completed (webhook)
                                  ▼
                     AWS Lambda (book-creator), async
                       1. GPT-5.2 writes the story + image prompts
                       2. Gemini 2.5 Flash Image draws the cover, then
                          12 pages in parallel using the cover as reference
                       3. Images → S3, book + pages → Postgres
                                  │
                       POST /api/stripe/process-checkout (shared secret)
                                  ▼
                     Next.js renders the PDF → S3 → emailed via Resend
```

If generation fails after retries, the Lambda deletes the partial book and the
app refunds the payment through Stripe and emails the customer.

## Features

- Child description, 4 art styles (cartoon, comics, anime, watercolor) and a free-text story prompt
- Prompt moderation (OpenAI `omni-moderation`) before the customer is charged
- Stripe Checkout for guests and signed-in users
- Email/password and Google sign-in, session management, password reset
- "My books" library, swipeable book reader, PDF download
- 6 languages: English, French, German, Spanish, Italian, Portuguese
- Per-IP rate limiting backed by DynamoDB

## Tech stack

| Area           | Tools                                                           |
| -------------- | --------------------------------------------------------------- |
| App            | Next.js 16 (App Router), React 19, TypeScript, Tailwind, daisyUI |
| Data           | PostgreSQL, Prisma 7                                            |
| Auth           | Lucia, Arctic (Google OAuth)                                    |
| Payments       | Stripe Checkout + webhooks                                      |
| Email          | Resend, React Email                                             |
| AI             | OpenRouter (GPT-5.2, Gemini 2.5 Flash Image), OpenAI moderation |
| Infrastructure | AWS Lambda, S3, CloudFront, DynamoDB, managed with Pulumi       |
| i18n           | next-intl                                                       |

## Running locally

Requirements: [Bun](https://bun.sh), a PostgreSQL database, an AWS account,
[Pulumi](https://www.pulumi.com/docs/install/), and Stripe, Resend, OpenAI,
OpenRouter and Google OAuth credentials.

```bash
git clone https://github.com/raphou00/coolbooks.git
cd coolbooks
cp .example.env .env      # fill in every value
bun install
bun run db:push           # create the database tables
```

Generate one random secret and use it for both the app and the Lambda:

```bash
openssl rand -hex 32      # → BOOK_CREATOR_SECRET in .env
cd aws
pulumi config set --secret BOOK_CREATOR_SECRET <same value>
pulumi config set --secret OPENROUTER_API_KEY <key>
pulumi config set --secret DATABASE_URL <url>
cd ..
bun run deploy:dev        # creates the Lambda, S3 bucket, CloudFront and DynamoDB table
```

Copy the Pulumi outputs (`bookCreatorArn`, `bucketName`, `cloudfrontUrl`,
`rateLimitsName`) into `.env`, then:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook   # in another terminal
bun run dev
```

The Lambda reports back to `APP_URL`, so for a full end-to-end run locally
`APP_URL` has to be reachable from AWS (e.g. through a tunnel).

## Scripts

| Command              | What it does                    |
| -------------------- | ------------------------------- |
| `bun run dev`        | Start the dev server            |
| `bun run build`      | Production build                |
| `bun run type-check` | TypeScript check                |
| `bun run lint`       | ESLint                          |
| `bun run db:studio`  | Browse the database             |
| `bun run deploy:dev` | Deploy AWS resources (Pulumi)   |
| `bun run destroy:dev`| Tear down AWS resources         |

## License

MIT
