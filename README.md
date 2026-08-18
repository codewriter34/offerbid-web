# OfferBid Web

Consumer marketplace for OfferBid — same NestJS API as the Android app. Marketing landing plus a full buyer/seller product.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- TanStack Query + Zustand
- Axios (JWT refresh) + Socket.IO

## Setup

```bash
cd offerbid-web
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) — that’s the marketing landing. The marketplace starts at `/explore`. Port 3000 is often another local app.

Point `.env.local` at a running API. Local Nest defaults:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3009/api/v1
NEXT_PUBLIC_SOCKET_URL=http://localhost:3009/realtime
```

## Environment

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Nest API base (`…/api/v1`) |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO URL (`…/realtime`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google Identity Services client ID |
| `NEXT_PUBLIC_APP_URL` | Public site URL (OG / sitemap) |

## Routes

| Path | Purpose |
|------|---------|
| `/` | Marketing landing |
| `/explore` | Guest-friendly feed |
| `/listings/[id]` | Listing detail + bids |
| `/auth` | Email/OTP + Google |
| `/onboarding/hub` | Complete profile / hub |
| `/sell` | Create listing |
| `/selling` | Seller dashboard |
| `/bids` | Buyer bids |
| `/notifications` | Inbox |
| `/profile` | Account |
| `/identity` | KYC |
| `/safety` | Meetup safety |
| `/terms` | Terms of use |
| `/privacy` | Privacy |

## Product notes

- Auth tokens live in `localStorage` (mobile parity).
- Listing, avatar, and identity photos use `POST /uploads/presign` with `{ purpose, files: [{ contentType }] }`. If S3 is unset the UI says “Uploads are not available yet”.
- Explore sends `city`, `location`, `category`, `page`, and `limit`. Price and sort are applied on listings already loaded.
- Never persist the hub sentinel `Other` — type the real city/neighborhood.
- WhatsApp handoff uses `whatsappUrl` from accept/contact. Google accounts without a phone can save a number on this device during hub onboarding.
- Brand: primary `#2070C8`, Syne + DM Sans.

## Local demo inventory

With the API running and Postgres migrated:

```bash
cd ../offerbid-api
npm run prisma:seed
```

Then on web, log in as `buyer.buea@offerbid.local` / `Demo1234!` to bid, or `seller.buea@offerbid.local` / `Demo1234!` to accept. Filter Explore to **Buea**.

## Deploy on Netlify

This is a Next.js App Router app. Netlify detects that and runs the OpenNext adapter — no extra plugin to install.

1. Push this repo and create a site from it in the [Netlify dashboard](https://app.netlify.com). Build command and publish directory are in `netlify.toml`.
2. Add environment variables (Site configuration → Environment variables), then trigger a new deploy so `NEXT_PUBLIC_*` values are baked into the client bundle:

   | Variable | Example |
   |----------|---------|
   | `NEXT_PUBLIC_API_BASE_URL` | `https://offerbid-api.onrender.com/api/v1` |
   | `NEXT_PUBLIC_SOCKET_URL` | `wss://offerbid-api.onrender.com/realtime` |
   | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google Identity Services client ID |
   | `NEXT_PUBLIC_APP_URL` | `https://your-site.netlify.app` (or the custom domain) |

3. On the Nest API, allow that site origin in CORS (and Socket.IO `origin`). Without it the browser will block every request.
4. In Google Cloud Console, add the same origin to **Authorized JavaScript origins** for the OAuth client.
5. After the first deploy, set `NEXT_PUBLIC_APP_URL` to the real URL (custom domain if you attach one) and redeploy so sitemap and Open Graph tags match.
