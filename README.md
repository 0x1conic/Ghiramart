# Griha Mart frontend

A responsive React implementation of the final cinematic Griha Mart customer, member, state, mobile and admin frames from Figma, connected to the deployed Griha Mart FastAPI service.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- React Router
- Framer Motion
- Lucide React
- Local Inter, Bebas Neue and Space Grotesk font packages

## Installation

```bash
npm install
cp .env.example .env
npm run dev
```

Production checks:

```bash
npm run typecheck
npm run build
npm run preview
```

With the preview server running on port `4173`, the Chromium route/interaction regression suite is available with:

```bash
npm run smoke
```

The smoke script expects system Chromium at `/usr/bin/chromium`; override the app URL with `SMOKE_BASE_URL` when needed.

## Environment

`VITE_API_BASE_URL` is the backend API root and defaults to `/api`. Vite preview/dev and Vercel proxy `/api` to `https://grihamart-api-production.up.railway.app`, avoiding browser CORS differences between local and production origins.

## Routes

| Route | Screen |
| --- | --- |
| `/` | Cinematic home |
| `/market`, `/search` | Catalog, search and filters |
| `/products/:productId` | Product story/details |
| `/cart` | Living basket / empty cart |
| `/checkout` | Delivery, payment and processing |
| `/order-confirmation/:orderId` | Order confirmation |
| `/login` | Customer login |
| `/register` | Membership registration |
| `/forgot-password`, `/reset-password` | Password recovery |
| `/member` | Member dashboard |
| `/member/addresses` | Saved addresses |
| `/member/orders` | Booking history and admin review status |
| `/member/orders/:orderId` | Booking details and admin review status (shipping paused) |
| `/rewards` | Rewards and referrals |
| `/account` | Account/profile |
| `/states` | Loading, empty, no-results, stock, payment, network and success states |
| `/admin` | Admin access |
| `/admin/dashboard` | Admin dashboard |
| `/admin/products` | Products |
| `/admin/products/new` | Add product |
| `/admin/products/:productId/edit` | Edit product |
| `/admin/orders` | Orders |
| `/admin/orders/:orderId` | Order management |
| `/admin/customers` | Customers and loyalty |
| `/admin/rewards` | Reward/referral management |
| `/admin/promotions` | Promotions |

## Component structure

```text
src/
├── components/
│   ├── admin/       Admin headers and shared control-room UI
│   ├── auth/        Shared authentication composition
│   ├── commerce/    Products, cart rows and order totals
│   ├── common/      Brand, product art, quantity and state primitives
│   ├── layouts/     Customer and admin route shells
│   ├── member/      Order tracking primitives
│   ├── motion/      Reduced-motion-aware page, reveal and float motion
│   └── navigation/  Desktop header and fixed mobile bottom navigation
├── context/         Interactive cart state and feedback
├── data/            Typed mock fixtures
├── pages/           Customer, member and admin route components
├── services/        Replaceable API client and mock repositories
└── types/           Backend-facing domain interfaces
```

## Backend integration notes

- The source contract is the deployed OpenAPI schema at `https://grihamart-api-production.up.railway.app/openapi.json`.
- `src/services/api.ts` supplies bearer-token handling, JSON/multipart requests, normalized FastAPI validation errors and separate customer/admin session tokens.
- Customer registration uses `POST /auth/signup` (`phone`, `full_name`, `password`); customer login uses `POST /auth/login` (`phone`, `password`). Admin login uses `POST /admin/login` (`email`, six-digit `code`).
- Products load from `GET /products`; published admin saves use multipart `POST /products` or `PATCH /products/{id}` with multiple `file` values. The curated catalog remains visible only when the remote catalog is empty or unavailable.
- Authenticated carts use `/cart` plus the increase, decrease and remove routes. Addresses use `/address`. Checkout creates COD orders through `POST /order`; member history uses `GET /order`; admin history uses `GET /admin/orders`.
- The API currently exposes no category, rewards, referrals, promotions, customer-list, password-recovery or admin order-status-update endpoints. Those screens retain isolated frontend data until corresponding routes exist; the frontend does not manufacture unsupported network calls.
- The backend currently supports `cod` only, so checkout exposes cash on delivery. Account security maps to `PATCH /user/password`.
- Domain contracts are in `src/types/index.ts`; exact wire DTOs are isolated in `src/services/apiContracts.ts` so backend naming does not leak into page components.

## Accessibility and motion

The application uses semantic landmarks, labels, keyboard-operable controls, visible focus rings, live regions for feedback, minimum mobile target sizing and safe-area padding. Framer Motion effects are centralized and disabled or softened when `prefers-reduced-motion` is enabled.

The homepage has no play/replay controls. Its oval and membership ring respond to scrolling; collection products enter as they reach the viewport. Decorative ripple pulses and initial product drift settle within five seconds. Reduced-motion mode disables these scroll transforms and ripples. The shared header exposes sign-in and sign-up on desktop and mobile, alongside the existing five-item mobile bottom navigation.

Run `npm run smoke` for 31 route, cart, image-transparency and form checks. Run `node scripts/arrival-check.mjs` against the local preview for scroll entrances, rings, ripples, authentication links, reduced motion and overflow checks on Home, Market, Rewards and Account at widths from 240px to 1440px. Browser scripts require system Chromium.

## Orders and local Wi-Fi access

The connected flow is **authenticated basket → saved/new address → COD checkout → order history**. The API owns products, authenticated carts, addresses and orders. Packing, rider assignment and delivery scheduling remain presentation states until matching backend routes are published.

Bearer tokens are kept in per-tab `sessionStorage`; closing the tab clears them. Local sample orders remain only as an offline visual fallback. Use the same host name (`localhost` or the Wi-Fi IP) throughout a session because browser storage is origin-specific.

To serve a built preview on your trusted local network:

```bash
npm run build
npm run preview -- --host 0.0.0.0 --port 4173
```

Open `http://<your-computers-wifi-ip>:4173` on the same Wi-Fi, and append `/admin/orders` for the admin view. The Wi-Fi address can change; find it with `ip -4 addr show`. Do not expose this development preview as a public production service.

Run `node scripts/booking-check.mjs` for end-to-end basket contents, contact details, duplicate-submit prevention, cross-tab admin updates, confirm/cancel, persistence, storage failure and responsive checks. Set `SMOKE_BASE_URL` to test a LAN address. The tests use an isolated browser profile and do not change your own saved demo bookings.

## Product studio and small screens

`/admin/products/new` opens a blank product studio with live preview, category, unique SKU, pack size, regular/sale prices, stock threshold, description, origin note, multi-image gallery, card colour and featured-homepage flag. Admins can select several JPG/PNG/WebP files, add library or HTTP(S) images, choose the cover, reorder and remove views. Product details expose the ordered gallery as accessible animated thumbnails. Save a complete draft, publish it to the market, or archive it without deleting order history. Archived products can be republished. `/admin/products` supports search and publication filters with responsive inventory cards rather than a wide table.

Admins can also create categories from `/admin/products`. New categories persist locally, appear immediately in product creation/editing, and become customer market filters. The category service is isolated in `src/services/categoryService.ts` for replacement with category API endpoints later.

Draft-only products persist locally because the API has no publication-state field. Publishing sends product fields and uploaded images as authenticated multipart data. The frontend resizes uploads to WebP, caps galleries at eight images and appends each image using the backend's repeated `file` field.

Product cards use container-based sizing, a dedicated badge/favourite toolbar and stacked price/actions in narrow cards. Product grids switch to one column below 360px. Watch-width navigation scrolls horizontally while preserving five keyboard-reachable destinations and 44px controls. On short watch-sized viewports the header scrolls away to leave space for content. Browser viewport tests are not a substitute for testing on real smartwatch browsers.

Run `node scripts/catalog-check.mjs` to verify create/draft/publish/edit/archive, persistence, cross-tab market updates, booking an admin-created item, badge/button collisions and 180–1440px product/shopping/admin layouts, including a 180×180 viewport. Existing visual grocery scenes remain curated marketing compositions; they are not an inventory administration view.

Run `npm run gallery-check` to verify multi-file upload, cover selection, publishing, customer thumbnail switching and narrow-mobile gallery layout end to end.

Sign-in and sign-up use their separate final desktop/mobile Figma compositions and exported animation tracks. Customer access follows the API's phone/password contract; admin access follows its email/six-digit-code contract. Groceries and the login sun/orbit animate automatically, and reduced-motion preferences are respected without an extra control.
