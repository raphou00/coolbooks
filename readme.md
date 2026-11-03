# 📚 Coolbooks

> Generate AI books for kids in under 2 minutes

## 📱 Features

- Describe your child's look with name
- Choose art style (cartoon, comics, anime, watercolor)
- Enter prompt for the story
- Receive the book in PDF format to your email

## 🛠 Tech Stack

- **Next.js** (App Router) + TypeScript
- **AWS**: DynamoDB (single-table data + rate limits), S3/CloudFront, Lambda (book generator), managed with Pulumi
- **Stripe** Checkout (CHF, card + TWINT)
- **OpenRouter** (story planning + illustrations), **OpenAI** (moderation, read-aloud)

## 🚀 Local development

```bash
bun install
cp .example.env .env        # fill in the values

# DynamoDB Local on port 8001, then create the tables
docker run -d --name coolbooks-dynamodb -p 8001:8000 \
  amazon/dynamodb-local:2.5.4 -jar DynamoDBLocal.jar -sharedDb -inMemory
bun run db:local

bun run dev
```

Set `DYNAMODB_ENDPOINT=http://localhost:8001` in `.env` for local development; leave it empty in production.

### Migrating existing Postgres data

```bash
DATABASE_URL=postgres://… bun run db:migrate --dry-run   # report only
DATABASE_URL=postgres://… bun run db:migrate             # copy into DATA_DYNAMODB_TABLE
```

## 🧠 Technical Highlights

- State management using React hooks
- Local persistence with AsyncStorage
- Component-based architecture
- Clean folder structure
- Mobile-first responsive layout

## 🔮 Possible Improvements

- Print the book, then delivery

## 📄 License

MIT License
