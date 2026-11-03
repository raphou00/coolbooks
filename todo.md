# Bibliboo: printed books, editor and reviews

How to run and test everything locally: see [LOCAL.md](LOCAL.md).

## Target workflow

```
1. Create      Customer describes the child and story, sees a free cover, picks the format
      ↓
2. Pay         ONE payment upfront, in CHF (Stripe Checkout, card + TWINT, promo codes allowed):
      ↓          📄 Digital CHF 14.90
      ↓          📕 Hardcover + digital CHF 44.90, Swiss shipping included
      ↓        Hardcover: the address is collected now (Switzerland only)
3. Generate    Lambda generates the book (2K pictures) and the PDF is emailed
      ↓
4. Edit        /book/[id]/edit: title, dedication, texts, page colours, earlier pictures;
      ↓        3 free redraws on the book page
5. Preview     /book/[id]/print: the exact print file, warnings, "I have checked" checkbox
      ↓
6. Confirm     "Confirm & print" (no second payment, address can be changed)
      ↓        The book is locked (snapshot), so later edits don't change the order
7. Print       Print PDF + wraparound cover uploaded, Gelato order created
      ↓
8. Track       Gelato webhook (in production, shipped with tracking, delivered) + emails
      ↓
9. Review      Review email ~7 days after delivery; any review earns a one-time 15% code
```

---

## Done (2026-11-03)

- [x] Rebrand to Bibliboo landed on main (DynamoDB, CHF, de/fr/it/en, cover preview, order sweeper)
- [x] Security branch `claude/jolly-hopper-zpiju4`: superseded, everything it did is in the relaunch
      (owner-only delete, Lambda callback secret, refunds). Branch left untouched, can be deleted
- [x] Currency is CHF (`src/config/stripe.ts`)
- [x] Local test mode: `bun run local` runs the whole shop with no cloud account (LOCAL.md)
- [x] Image model: Nano Banana 2 (`google/gemini-3.1-flash-image-preview`) at 2K via OpenRouter,
      overridable with `IMAGE_MODEL` (e.g. `google/gemini-3-pro-image-preview` for Pro)
- [x] Monthly AI budget cap `AI_MONTHLY_BUDGET_USD` (default $50): estimated spend per call is counted
      in `BUDGET#<month>`; at the cap free previews and redraws pause, paid books still finish,
      the admin gets one email
- [x] Emailed PDF uses 1400 px JPEGs (2K PNGs would make it ~60 MB)
- [x] Shipping Switzerland only; hardcover offer behind `NEXT_PUBLIC_PRINT_ENABLED`
- [x] Removed the struck-through CHF 19.90 "regular price" (it was never charged)
- [x] Print PDF `src/lib/print.ts`: one file in Gelato's photo book layout (cover spread, blank
      endpaper, 30 inner pages of 206 × 206 mm with 3 mm bleed, blank endpaper). Inner pages: title,
      "belongs to", dedication, picture + text per story page, The End, colophon, padding.
      10 mm safe margin; warnings for long text and soft pictures
- [x] Wraparound cover from Gelato's `cover-dimensions` API (estimated when there's no key)
- [x] `PrintOrder` (`PRINT#<id>`): created when a hardcover book is ready, confirm email,
      reminders after 3, 7 and 14 days, print part refunded after 60 days. Never printed without
      the customer's confirmation
- [x] "Confirm & print": snapshot, print file uploaded, Gelato order (`orderType: draft` by default),
      automatic refund of the print part + email if it fails
- [x] `/api/gelato/webhook?secret=…`: in production / shipped (email with tracking) / delivered /
      canceled. Local simulator at `/api/dev/gelato`
- [x] Book editor: title, dedication, page texts (600 chars) and colours, switch back to an earlier
      picture after a redraw (`Page.previousImages`); the emailed PDF is rebuilt on save. Locked after confirming
- [x] Review email ~7 days after delivery (or shipping + 10 days), no-login `/review/[token]`,
      stars + text, one-time 15% Stripe promotion code valid 90 days for ANY review
- [x] `/admin/reviews` moderation (`bun run make-admin <email>`), approved reviews on the homepage
      with "Verified buyer · received a discount"
- [x] All new pages and emails in de, fr, it, en

## Next: things only you can do

- [ ] Create a Gelato account and an API key
- [ ] Order **1 sample book by hand** in the Gelato dashboard: on a local hardcover order, open
      the print preview, *Open the print file*, and upload that PDF
  - [ ] Confirm that books for Swiss addresses are **produced in Switzerland** (no customs or import VAT)
  - [ ] Confirm the exact `productUid` of the 20 × 20 cm hardcover and set `GELATO_PRODUCT_UID`
        (the default in `src/lib/env.ts` is a guess based on Gelato's naming)
  - [ ] Confirm `pageCount` = inner pages only (we send 30) and that the single-PDF layout
        (cover spread, endpaper, pages, endpaper) is what they expect
  - [ ] Check text margins, the spine title and the back cover on the real book
  - [ ] Note the real price of printing + shipping to CH, then adjust `printPrice` (CHF 44.90)
- [ ] Generate the same 3 books with Nano Banana 2 and Pro (`AI_MODE=real`, `IMAGE_MODEL=…`) and
      compare character consistency; keep NB2 unless Pro is clearly better
  - NB2 2K ≈ $0.101 / picture ≈ $1.35 per book; Pro 2K ≈ $0.134 ≈ $1.80 (check OpenRouter prices)
- [ ] Set a credit limit on the OpenRouter key too (second safety net next to the app's cap)
- [ ] Swiss VAT: registration is only needed above CHF 100k turnover
- [ ] Update the Terms and refund policy: they still say texts can't be edited and that all sales
      are final; printed books, the editor, partial refunds and review codes need a mention
- [ ] The `REVIEW15` coupon is created automatically: check it in the Stripe dashboard after the first review

## Infra, later (not touched yet)

Nothing below has been deployed. The code works locally; production needs:

- [ ] Redeploy the book-creator Lambda (2K pictures, spend counter, picture history)
- [ ] Vercel env: `NEXT_PUBLIC_PRINT_ENABLED=true`, `GELATO_API_KEY`, `GELATO_PRODUCT_UID`,
      `GELATO_WEBHOOK_SECRET`, `GELATO_ORDER_TYPE` (`draft` until the sample is approved, then `order`),
      `AI_MONTHLY_BUDGET_USD`, `REVIEW_DELAY_DAYS` (7)
- [ ] Register `https://bibliboo.ch/api/gelato/webhook?secret=…` in Gelato for
      "order status updated" and "tracking code updated"
- [ ] The existing 10-minute order cron now also sends print reminders and review emails:
      no new schedule needed
- [ ] Gelato downloads print files from CloudFront: check the bucket allows it

## Later

- [ ] Digital → hardcover upgrade: a second Checkout for the difference, then the same confirm flow
- [ ] "Fix this image" with a short instruction (image editing with the current picture + cover),
      moderated, using a redraw credit
- [ ] Paid redraw packs (e.g. 5 redraws) through a small Checkout
- [ ] Image framing (zoom, move, flip), swap pictures between pages, page layouts
- [ ] Optional photo of the book in reviews; a second review reminder after 7 days
- [ ] Free teaser for the digital book (cover + story text) behind a verified email, daily cap
