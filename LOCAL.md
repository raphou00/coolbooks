# Running Bibliboo locally

Everything runs on your machine: no AWS, Stripe, Resend, Gelato or AI account needed. Pictures are placeholders drawn for free, payments go through a fake "Pay (test)" page, emails land in a local inbox, and print orders are a dry run.

## One-time setup

You need [Bun](https://bun.sh) and [Docker](https://www.docker.com/products/docker-desktop/) running.

```bash
bun install
cp local.example.env .env
```

## Start

```bash
bun run local
```

This starts DynamoDB Local in Docker (data is kept between runs), creates the tables and starts the site at http://localhost:3000.

Next time, `bun run local` again is enough. To wipe all local data: `docker compose down -v && rm -rf .local`.

## Handy local pages

| Page | What it does |
| --- | --- |
| http://localhost:3000/api/dev/emails | Every email the shop "sent" (receipts, print confirmations, review requests, sign-up codes) |
| http://localhost:3000/api/dev/gelato | Print orders, with buttons to pretend Gelato moved them to production, shipped or delivered |
| http://localhost:3000/api/dev/cron | Runs the scheduled jobs once: order retries, print reminders, review emails |

Files (pictures, PDFs, print files) are saved in `.local/files/`.

## Test checklist

1. **Digital book.** Go to "Buch erstellen", fill in the form, see the cover, pick *PDF-Buch*, pay on the test page. After ~10 s the "Dein Buch ist bereit" email appears in the inbox. Open the book, try "Boo liest vor" and a redraw.
2. **Hardcover.** Same, but pick *Gebundenes Buch* and enter a Swiss address on the test page. You get a "Bitte prüfe dein Buch vor dem Druck" email.
3. **Editor.** From the book page, *Texte ändern*: change the title, a text, a page colour. Save, then reopen the PDF: it has the changes.
4. **Print preview.** Open *Bestätigen und drucken*. The PDF on the left is the exact print file (cover spread, endpapers, 30 inner pages). Tick the box and confirm. The terminal prints the Gelato order that *would* be sent, and the book is now locked (no more edits or redraws).
5. **Shipping.** In the Gelato simulator press *shipped*, then *delivered*. The customer gets a "Dein Buch ist unterwegs" email with a tracking link.
6. **Review.** Open the cron page. With `REVIEW_DELAY_DAYS=0` the review email is sent right away. Leave a review: you get a `BOO-…` code (on the page and by email).
7. **Approve the review.** Register an account on the site (you're logged in right away), then run `bun run make-admin you@example.com` and open http://localhost:3000/admin/reviews. Approved reviews appear at the bottom of the homepage.
8. **Budget cap.** Set `AI_MONTHLY_BUDGET_USD=2` in `.env` and restart. Mock calls count as if they were real, so after one book and a few previews, new previews and redraws are paused and the admin gets an email. Paid books still finish.

## Testing with real services (optional)

Each one can be switched on separately in `.env`:

- **Real AI pictures:** `AI_MODE=real` and an `OPENROUTER_API_KEY`. A full book costs about $1.35 with Nano Banana 2 at 2K. Set a credit limit on the key in OpenRouter first. Add `OPENAI_API_KEY` for moderation and read-aloud.
- **Stripe test mode:** `PAYMENTS=stripe` with your *test* keys, then in another terminal `stripe listen --forward-to localhost:3000/api/stripe/webhook` and copy the `whsec_…` it prints into `STRIPE_WEBHOOK_SECRET`. Pay with card 4242 4242 4242 4242.
- **Gelato:** set `GELATO_API_KEY`. Orders are created as **drafts** (`GELATO_ORDER_TYPE=draft`), visible in the Gelato dashboard and only printed if you approve them there. Gelato needs to download the print file from a public URL, so this only works fully once files are on S3/CloudFront; locally, use *Open the print file* on the preview page and upload that PDF by hand in the Gelato dashboard for the sample book.
