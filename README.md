# Dating App

Minimal README for the backend API.

## What this app is

A simple Node.js / Express backend for a dating/matching app. It provides user authentication, profile management, preferences, connection feed & matches, and reactions (like/dislike). Uses MongoDB for storage, Redis for caching/rate-limiting/hits, Firebase for authentication/notifications, and Supabase for image storage.

## Quick start

1. Install dependencies: `npm install`
2. Build: `npm run build` (compiles TypeScript to `dist`)
3. Run (development): `npm run watch:dev` or run built app: `npm run start:dev`
4. Server default port: `3000`

## Required external services & env

* MongoDB (set `MONGODB_URI`)
* Redis (`REDIS_HOST`, `REDIS_PORT`, `REDIS_USERNAME`, `REDIS_PASSWORD`)
* Supabase (storage): `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`
* JWT key files: `JWT_PRIVATE_KEY_FILE_NAME`, `JWT_PUBLIC_KEY_FILE_NAME` (the app reads key files by name)
* Firebase service account file (project includes `serviceAccountKey.json` placeholder)
* `ENV` (environment, e.g. `DEVELOPMENT` / `PRODUCTION`)

## Scripts

* `npm run build` — compile TypeScript into `dist`
* `npm run start:dev` — run built app in DEVELOPMENT mode
* `npm run start:prod` — run built app in PRODUCTION mode
* `npm run watch:dev` — run with `tsx` watcher for development

## Base URL

`http://localhost:3000` (default)

All API routes are mounted under `/api` or `/api/v1` as shown below.

## Endpoints (brief)

* `GET /api/health/`

  * Purpose: Health check. Returns uptime and server timestamp.
  * Auth: none

* `POST /api/v1/auth/`

  * Purpose: Authenticate or register a user (phone/email verification with Firebase + create user if not exists). Returns an auth token (JWT).
  * Auth: none

* `PATCH /api/v1/profile/`

  * Purpose: Update authenticated user's profile (profile fields like name, dob, bio, etc.).
  * Auth: **required**

* `PATCH /api/v1/profile/image`

  * Purpose: Upload/update the authenticated user's profile image (multipart/form-data file upload). Stores image in Supabase storage.
  * Auth: **required**

* `PATCH /api/v1/preferences/`

  * Purpose: Update authenticated user's matching preferences (age range, distance, gender preferences, etc.).
  * Auth: **required**

* `GET /api/v1/connections/feed/:page`

  * Purpose: Fetch a paginated feed of potential matches for the authenticated user (page is a number).
  * Auth: **required**

* `GET /api/v1/connections/matches`

  * Purpose: Fetch list of mutual matches for the authenticated user.
  * Auth: **required**

* `POST /api/v1/reaction/:userId`

  * Purpose: Create a reaction (like, dislike, super-like, etc.) from the authenticated user toward `:userId`. May trigger notifications on mutual likes.
  * Auth: **required**

## Notes

* Authentication middleware (`requireAuth`) protects most endpoints and expects a valid JWT token.
* Profile image upload uses a Multer middleware and Supabase storage service.
* Rate limiting, hit counting, error handling and logging middlewares are wired into the app.
