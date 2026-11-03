# Coolbooks: printed books, editor and reviews

## Target workflow

```
1. Create      Customer describes the child and story, then chooses the format
      ↓
2. Pay         ONE payment upfront, in CHF:
      ↓          📄 Digital (e.g. CHF 9.90)
      ↓          📕 Hardcover + digital, shipping in Switzerland included (e.g. CHF 39–49)
      ↓        Hardcover: the address is collected now (Switzerland only)
3. Generate    Lambda generates the book and the PDF is emailed (as today)
      ↓
4. Edit        /book/[id]/edit: change texts, layouts, image framing,
      ↓        3 free image regenerations included
5. Preview     Print preview of every page, warnings, "I approve this book" checkbox
      ↓
6. Confirm     Hardcover: "Confirm & print" (no second payment, address can be changed)
      ↓        Digital: "Upgrade to hardcover" = pay the difference (the only second payment)
      ↓        The book is locked (snapshot), so later edits don't change the order
7. Print       Build the print PDF and cover, then create the Gelato order
      ↓
8. Track       Gelato webhooks (in production, shipped with tracking, delivered)
      ↓        Status emails to the customer
9. Review      Review email ~7 days after delivery. A submitted review earns a
               15% one-time code for the next order
```

---

## Phase 0: Preparation

- [ ] Merge the security branch `claude/jolly-hopper-zpiju4` (owner-only delete, secured
      `process-checkout`, refunds). `process-checkout` will be reworked below, so merge it first
- [ ] Switch the currency from `USD` to `CHF` in `src/config/stripe.ts`
- [ ] Create a Gelato account and an API key (test key first)
- [ ] Order **1 sample book by hand** in the Gelato dashboard (20×20 cm hardcover) from an existing book
  - [ ] Confirm that books for Swiss addresses are **produced in Switzerland** (no customs or import VAT for the customer)
  - [ ] Confirm whether `pageCount` includes the cover pages, the minimum inner pages (30?) and whether pages must come in multiples of 2 or 4
  - [ ] Confirm the file format: one PDF (cover + inner pages) or a separate cover file
  - [ ] Note the real price of printing + shipping to CH, then set the selling price of the printed book
- [ ] Swiss VAT: check whether you go over the CHF 100k turnover threshold (registration is needed only above it)
- [ ] **Image model test**: generate the same 3 books with Nano Banana Pro (`gemini-3-pro-image`) and
      Nano Banana 2 (`gemini-3.1-flash-image`) at 2K and compare character consistency
  - Nano Banana Pro 2K ≈ $0.134 / image, so a full book (13 images) ≈ $1.80 and with 3 regenerations ≈ $2.20
  - Nano Banana 2 2K ≈ $0.101 / image, so ≈ $1.35 and ≈ $1.70
  - Check the current prices on Google's pricing page and add a hard monthly budget limit
- [ ] No free full-book preview (each unpaid book costs ~$2). Maybe later: a free **cover + story text** teaser
      (~$0.20), behind a verified email, with a daily cap

## Phase 1: Print-ready book

- [ ] **High-resolution images**: generate at **2K** (2048 px ≈ 260 DPI at 20 cm, good for print) with the model
      chosen in Phase 0, so no upscaler is needed. The current images are ~1024 px (≈ 130 DPI, too soft)
- [ ] `src/lib/print.ts`: a separate print PDF generator (keep `export.ts` for the emailed PDF)
  - [ ] Single pages of 206×206 mm (200 mm + 3 mm bleed), no spreads
  - [ ] Each story spread becomes 2 pages (image page + text page), so 12 spreads = 24 pages
  - [ ] Automatic padding pages to reach the minimum: title page, "This book belongs to …",
        dedication, "The End", end pages
  - [ ] Safe margin of ~10 mm for text
- [ ] Hardcover wraparound cover: call `GET product.gelatoapis.com/v3/products/{uid}/cover-dimensions?pageCount=…`
      and build back + spine + front (back: colour, short blurb, logo)
- [ ] Check the generated PDF in the Gelato dashboard, then place a real test order

## Phase 2: Book editor (`/book/[bookId]/edit`)

Owner only (reuse the owner check from the security branch). Guests need an account, or an
email "magic link" to edit their book.

### Data (Prisma)
- [ ] `Page.layout` enum: `IMAGE_LEFT`, `IMAGE_RIGHT`, `FULL_IMAGE_TEXT_TOP`, `FULL_IMAGE_TEXT_BOTTOM`
- [ ] `Page.imageX`, `Page.imageY`, `Page.imageZoom` (image framing)
- [ ] `PageImage` table (image history per page, so the customer can switch back to an old one for free)
- [ ] `Book.status` enum: `GENERATING` → `READY` → `LOCKED` (ordered)
- [ ] `Book.regenCredits` Int (default 3)
- [ ] `Book.dedication` String? (optional)

### Free edits (no generation)
- [ ] Edit the title and the text of each page (character limit + a warning if the text overflows)
- [ ] Change each page's layout and background colour
- [ ] Image framing: zoom and move it (cropping), flip it horizontally
- [ ] Swap images between two pages
- [ ] Go back to an earlier version of an image (`PageImage` history)
- [ ] Autosave + live preview of the page (same rendering as the PDF)

### Image regeneration (the "infinite generations" problem)
Recommendation: **3 free regenerations per book**, then paid packs.
- [ ] Each regeneration uses 1 credit (`regenCredits`), checked on the server
- [ ] "Fix this image" with a short instruction ("make the dog brown"): image editing that uses the current
      image + cover as reference. More precise than regenerating from scratch, so fewer wasted attempts
- [ ] The old image stays in the history, so a regeneration never loses the previous image
- [ ] Paid credit pack (e.g. 5 regenerations) through a small Stripe Checkout
- [ ] Rate limit (reuse `src/lib/rate-limiter.ts`)
- [ ] Moderate the customer's instructions (prevent abuse of the image model)

## Phase 3: Print order + Gelato

### Preview and confirmation
- [ ] "Print preview" page: flip through all pages exactly as printed (including padding pages and back cover)
- [ ] Automatic warnings: text too long, image too low-res after framing, title missing
- [ ] Required checkbox: "I have checked the texts and images; the book will be printed as shown"

### Payment
- [ ] New `PrintOrder` model: `id`, `bookId`, `userId`, `status`, `stripeSessionId`, `gelatoOrderId`,
      `snapshot` (Json: frozen title/pages/layouts), `pdfKey`, `coverKey`, `shippingAddress` (Json),
      `trackingUrl`, `shippedAt`, `deliveredAt`, `reviewEmailSentAt`, `createdAt`
- [ ] The first checkout offers 2 products: Digital / Hardcover + digital (`mode: "payment"`, currency `CHF`,
      `allow_promotion_codes: true`)
- [ ] Hardcover: `shipping_address_collection: { allowed_countries: ["CH"] }`, and on payment create a
      `PrintOrder` with `status = AWAITING_CONFIRMATION`
- [ ] Show the price including shipping (no surprise fees)
- [ ] "Confirm & print" (no payment): check/change the address, then set `Book.status = LOCKED`, save the snapshot
      and send to Gelato
- [ ] Not confirmed: reminder emails after 3, 7 and 14 days. Never print automatically.
      After 60 days, refund the print part (the digital book stays)
- [ ] Digital → hardcover upgrade: a second Checkout for the **difference only** (hardcover price − digital price),
      then the same "Confirm & print" flow
- [ ] Cash flow: the customer always pays before you pay Gelato, so there's no money to front

### Sending to Gelato
- [ ] Generate the print PDF + cover from the **snapshot**, then upload to S3
- [ ] `POST order.gelatoapis.com/v4/orders`: `orderReferenceId = PrintOrder.id`, `productUid`,
      `pageCount`, `files`, shipping address (CH)
- [ ] If Gelato rejects the order, refund automatically and email the customer (same logic as the security branch)
- [ ] Order confirmation email to the customer

### Tracking
- [ ] `/api/gelato/webhook` route (secured) that updates `PrintOrder.status`, `trackingUrl`, `shippedAt`, `deliveredAt`
- [ ] "Your book has shipped" email with the tracking link
- [ ] Order status visible on the book page and in the account

## Phase 4: Reviews + 15% code

### Sending
- [ ] Daily job (AWS EventBridge → Lambda, or a Next.js cron): find `PrintOrder`s with
      `deliveredAt + 7 days` (or `shippedAt + 10 days` if Gelato doesn't report delivery)
      and `reviewEmailSentAt = null`
- [ ] "How was your book?" email with a unique link `/review/[token]` (no login needed)
- [ ] Optional reminder after another 7 days, then stop

### Collection
- [ ] `Review` model: `id`, `printOrderId` (unique: 1 review per order), `userId`, `rating` (1–5),
      `text`, `photo`? (optional), `approved` (moderation), `promoCode`, `createdAt`
- [ ] Form: stars + text + optional photo of the book
- [ ] Admin moderation before a review is shown on the site

### 15% reward
- [ ] Create a Stripe `coupon` once: `percent_off: 15`, `duration: "once"`
- [ ] For each review, create a unique `promotion_code`: `max_redemptions: 1`, expires after 90 days,
      restricted to the customer when they have a Stripe customer ID
- [ ] Email the code + show it on the "thank you" page
- [ ] ⚠️ The code is earned for **any** review, positive or not. Never make it depend on the rating
      (rewarding only positive reviews is misleading for customers and illegal in many places)
- [ ] Show "Verified buyer · received a discount" on published reviews
- [ ] Display approved reviews on the homepage (social proof)

## Phase 5: Cleanup
- [ ] Remove the fake struck-through price (`price * 1.2`) in `home.tsx` and `new.tsx`
- [ ] Translate every new email and page into the 6 languages (`locales/*.json`)
- [ ] Update the README (printing, editor, reviews)
