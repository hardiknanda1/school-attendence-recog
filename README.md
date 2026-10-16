# School Attendance — Marketing Website

A marketing website for a facial-recognition attendance product for schools.
Built with Next.js (App Router), TypeScript, Tailwind CSS, Framer Motion and an
HTML canvas for the scroll-controlled hero animation.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
npm run lint
```

## Before launch: things to configure

| What | Where |
| --- | --- |
| Brand name (currently the placeholder **"Your Brand"**) | `lib/site.ts` → `site.name` |
| Logo (a neutral placeholder mark is shown until set) | add a file to `public/`, then set `site.logoSrc` |
| Optional public contact email on `/contact` | `lib/site.ts` → `site.publicEmail` |
| **Contact form delivery** (required for the form to send) | environment variables — see below |
| **Privacy Policy** (`/privacy` is a clearly marked placeholder) | `app/privacy/page.tsx` |
| Page copy | `components/home/*`, `components/hero/ScrollHero.tsx` |

### Contact form delivery

The form posts to `app/api/contact/route.ts`, which validates the input on the
server (shared rules in `lib/contact-schema.ts`) and hands it to
`lib/contact-delivery.ts`, the single integration point. Configure **one**
provider via environment variables (copy `.env.example` to `.env.local`):

- **Webhook**: `CONTACT_WEBHOOK_URL` (+ optional `CONTACT_WEBHOOK_SECRET`, sent as a Bearer token). Receives the enquiry as JSON.
- **Resend email**: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`.

Until a provider is configured, the API returns `503 not_configured` and the
form tells the visitor their message was **not** sent. Success is shown only
after the provider accepts the message (a 2xx response).

Abuse protection: JSON-only requests, a 16 KB body limit, a same-origin check,
a honeypot field, a minimum fill time, and a per-IP rate limit (5 requests per
10 minutes). The rate limiter is in-memory, so each server instance counts
separately. On serverless or multi-instance hosting, add platform-level rate
limiting (e.g. a WAF rule) as well.

## Hero animation

- **Frames**: `public/frames/frame-NNNN.webp`, produced from the supplied ZIP by
  `scripts/prepare-frames.py` (re-encoded to WebP at the original 1280×720;
  composition is unchanged). The supplied export has no frames 60–65, 80–85 or
  125–130. Those gaps were left unfilled, and playback cross-dissolves between
  the neighbouring supplied frames. The playback order is in the generated
  `lib/frame-manifest.ts`.
- **To replace the frames**: extract the new ZIP into a folder, then run
  `python3 scripts/prepare-frames.py <folder>` (requires Pillow).
- **Playback** (`components/hero/ScrollHero.tsx`): the hero is pinned for 350vh
  of scrolling. Scroll progress drives a smoothed playhead that draws into a
  canvas, so scrolling down plays forward and scrolling up reverses. The
  sequence finishes at 90% of the pinned scroll, and the final empty-lobby
  frame holds for the closing message.
- **Loading** (`components/hero/frame-sequence.ts`): frames are fetched
  progressively with the opening and nearby frames first, plus evenly spaced
  keyframes. Only frames near the playhead stay decoded, which bounds memory.
- **Layout** (`components/hero/hero-layout.ts` + `.hero-media` in
  `app/globals.css`): landscape screens use a right-anchored cover crop that
  keeps the scanner in view. Portrait screens use a dedicated crop of the right
  of the frame, with the headline above it.
- **Fallbacks**: the first frame is rendered as a static `<img>` underneath the
  canvas. It is what shows with `prefers-reduced-motion` (the hero then becomes
  a single static screen), if canvas is unavailable, or if frames fail to load.
