# CareerHub

CareerHub is a career-discovery prototype by Kareem Mohamed Bakr. It combines a portfolio landing page with a browser-based career preview: sample role search, a seven-day planning tool, a career toolkit, and an application tracker.

## Live preview

- [CareerHub preview](https://kareem-mohammed-bakr.github.io/CareerHub/careerhub.html)
- [Portfolio homepage](https://kareem-mohammed-bakr.github.io/CareerHub/)

The preview is public and serves the static frontend. Sample roles are illustrative; live accounts, listings, and applications require the separately hosted API and database.

## What works in the local preview

- Search and filter the clearly labeled illustrative sample roles.
- When `VITE_API_URL` points to a configured CareerHub API, browse its published jobs and use its title, company, skill, category, location, and workplace filters.
- With an active, verified job-seeker session on that API, submit an application and view its account status in the tracker.
- Save a shortlist in the current browser.
- Create and check off a seven-day Career Launchpad plan.
- Use the job-search checklist and draft an interview story with the STAR structure; drafts stay in the current browser.
- Add, filter, update, delete, and export manual tracker entries as CSV. These notes stay on the current device; they are not sent to an API.
- Ask the local CareerHub guide about the preview in English or Arabic. It answers from documented behavior and explains unavailable features. No generative AI provider is configured.
- View the owner portrait, biography, public-profile links, and captioned project videos.

The application and salary figures shown in sample roles are illustrative, not live vacancies or verified market data. Applications are disabled for sample roles. Live listings and account applications require a configured API and an active, verified account. CareerHub does not provide personalized job matching, geolocate users, or offer a Career Locator. Profile and resume API modules are foundations and are not connected to the browser workflows. Registration verification and password recovery need an email delivery service before new accounts can be used reliably.

## Repository layout

- `frontend/` — React 19, TypeScript, Vite static pages and local-first tools.
- `backend/` — Express 5 and Prisma API foundation for PostgreSQL-backed accounts, jobs, applications, profiles, companies, notifications, and messages.
- `backend/prisma/` — schema and initial migration.
- `.github/workflows/pages.yml` — manually triggered static preview deployment. It does not deploy the API or database.

`docker-compose.yml` provides a local development stack with PostgreSQL, a migration step, the API, and the static frontend. It is not a production deployment configuration. The API still needs an email delivery service and real job data before end-to-end account workflows are complete.

## Run the frontend locally

Requirements: Node.js 22 or newer and npm.

```powershell
cd frontend
npm ci
npm run dev
```

Vite prints the local address. The portfolio is at `/`; the CareerHub preview, owner page, toolkit, and tracker are at `/careerhub.html`, `/about.html`, `/resources.html`, and `/tracker.html`.

To point the UI at a local API, copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL`, for example `http://localhost:4000/api/v1`. The browser preview remains useful without the API. Never place private keys in `VITE_*` variables; Vite exposes them to browser code.

## Run the local stack with Docker Compose

Requirements: Docker Desktop with the Compose plugin.

1. Copy `.env.compose.example` to `.env` and replace all placeholder secrets with different local-only values. Keep the PostgreSQL password URL-safe (letters, numbers, `_`, or `-`).
2. Run `docker compose up --build` from the repository root.
3. Open `http://localhost:8080`; the API health endpoint is `http://localhost:4000/health`.

The Compose stack creates a persistent named PostgreSQL volume and applies the checked-in migrations. `docker compose down` stops the containers while preserving the database volume. Do not use `docker compose down -v` unless you intend to delete that database.

## Run the API locally

Requirements: Node.js 22 or newer, pnpm, and a local PostgreSQL database for development.

1. Start an empty development database. No database is bundled with this repository.
2. In `backend/`, install dependencies with `pnpm install` and copy `.env.example` to `.env`.
3. Set a development `DATABASE_URL` and two different random JWT secrets, each at least 32 characters.
4. Run `pnpm prisma:generate`, then `pnpm prisma:migrate` against that development database.
5. Run `pnpm dev`. The API uses port `4000` by default, exposes `/health`, and serves API docs at `/docs`.

The backend migration command is for a development database. Review migrations and back up data before applying changes to any other database. No production credentials or database are included.

## Checks

From `frontend/`:

```powershell
npm test
npm run lint
npm run build
```

The frontend Node test suite covers local-guide disclosures, Arabic search normalization, and CSV formula-injection handling. The backend Node tests cover the active/verified-account session policy; API route and database workflows still need integration tests against a configured test database. Frontend type-check and production build plus backend type-check were also run for this handover. Production readiness still depends on PostgreSQL, email verification and password-reset delivery, and a real job-data source.

## Security and data boundaries

- Access tokens are kept in memory by the frontend. The refresh token is intended for an HttpOnly cookie; protected requests can rotate it through `/auth/refresh`.
- The API requires verified, active accounts for sign-in and token refresh. Email verification and password-reset messages are not sent until an email provider is integrated; new registrations therefore remain pending and cannot sign in yet.
- Company accounts need verification before publishing a job.
- The application tracker, checklist, saved roles, Launchpad, interview draft, and guide language preference use browser storage. Clearing that browser data removes them.
- The CSV export prefixes spreadsheet formula-like values before quoting cells.
- Keep `.env` files out of Git. Only the explicitly named example environment files with placeholders belong in the repository.

## Internationalization and assistant limits

The site and local guide support English and Arabic, with a small amount of supporting copy still in English. Dates, numbers, and sample salary labels use the selected locale. Country and time-zone settings are not implemented. There is no configured generative AI service; the guide is a deterministic, local help fallback and does not use personal profiles or send questions to a provider.

## Images and video

The project uses the portrait directly supplied by Kareem and local project walkthrough videos. The separate Google share URL in the latest project brief was not accessible, so it was not downloaded. Editorial photography links to the listed source pages and the Unsplash license.

## Deployment

The portfolio and CareerHub preview are published through GitHub Pages. The workflow in `.github/workflows/pages.yml` is manually triggered and publishes only the static frontend. The Express API, PostgreSQL, email delivery, and persistent user accounts still require separate hosting and production configuration.
