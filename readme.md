# 📚 Bibliboo

> Personalised picture books for Swiss children, written and illustrated by AI, as a PDF or a printed hardcover

## 📱 Features

- Describe the child (name, look, age) and a story idea, pick an art style
- Free cover preview before paying; one payment in CHF (card, TWINT)
- Story in German, French, Italian or English; 12 illustrated pages, dedication page
- PDF by email, read online with "Boo reads" audio, 3 free page redraws
- Book editor: titles, texts, page colours, earlier pictures
- Printed hardcover through Gelato (Switzerland only): print preview, "Confirm & print", tracking emails
- Review email after delivery with a one-time 15% code; approved reviews on the homepage

## 🛠 Tech Stack

- **Next.js** (App Router) + TypeScript, next-intl (de, fr, it, en)
- **AWS**: DynamoDB (single-table data + rate limits), S3/CloudFront, Lambda (book generator), managed with Pulumi
- **Stripe** Checkout (CHF, card + TWINT)
- **OpenRouter** (story planning + Nano Banana 2 illustrations), **OpenAI** (moderation, read-aloud)
- **Gelato** print API, **Resend** email

## 🚀 Local development

See **[LOCAL.md](LOCAL.md)**: `bun install`, `cp local.example.env .env`, `bun run local`. No cloud account needed.

Work in progress and next steps: [todo.md](todo.md).

### Migrating existing Postgres data

```bash
DATABASE_URL=postgres://… bun run db:migrate --dry-run   # report only
DATABASE_URL=postgres://… bun run db:migrate             # copy into DATA_DYNAMODB_TABLE
```

## 📄 License

MIT License
