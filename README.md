# Firefighter Log

Monorepo layout:

- **`api/`** — NestJS (TypeScript): `GET /health`, MySQL via TypeORM, JWT auth (`/auth/*`), call logs (`/call-logs/*`), profile (`/profile`, `/ranks`, `/fire-stations`)
- **`app/`** — Expo (TypeScript): register, log in, home dashboard, call log create/list, **Account** (profile, stations, rank)
- **`docker-compose.yml`** — `api` + `web` (Expo Metro) + MySQL 8; API waits for MySQL health, runs migrations on startup

Database tables: **`users`** (name, rank, career year), **`ranks`**, **`fire_stations`**, **`user_fire_stations`** (membership + `joined_at`), **`call_logs`**, lookup tables for call types and apparatus.

## Prerequisites

- Node.js 20+
- npm
- Docker (optional, for Compose)

## API environment (local, without Docker for MySQL)

Copy [`api/.env.example`](api/.env.example) to `api/.env` and set at least **`JWT_SECRET`**. With MySQL from Compose running on the host:

```env
DATABASE_HOST=127.0.0.1
DATABASE_PORT=3306
DATABASE_USER=app
DATABASE_PASSWORD=apppass
DATABASE_NAME=firefighter_log
JWT_SECRET=your-dev-secret
```

Then:

```bash
cd api
npm install
npm run start:dev
```

- [http://localhost:3000/health](http://localhost:3000/health)
- `POST /auth/register` — body `{ "email", "password" }` (password min 8 chars)
- `POST /auth/login` — body `{ "email", "password" }`
- `GET /auth/me` — header `Authorization: Bearer <token>`
- `GET /call-logs/stats` — header `Authorization: Bearer <token>` — response `{ "total": number }` (count of `call_logs` rows for the authenticated user)
- `GET /profile` — JWT — full profile (email, name, rank, year started, fire station memberships)
- `PATCH /profile` — JWT — partial update; changing **email** or **password** requires `currentPassword`; response may include a new `access_token` when email changes
- `GET /ranks`, `GET /fire-stations`, `POST /fire-stations` — JWT (directory for Account)
- `POST /profile/stations`, `PATCH /profile/stations/:id`, `DELETE /profile/stations/:id` — JWT — manage station memberships

Migrations run automatically when the API starts (`migrationsRun: true`). To run migrations manually: `npm run migration:run` (requires DB env and `src/data-source.ts`).

### Dev-only: seed fake `call_logs` rows

Inserts realistic `call_logs` for an **existing** user (append-only; re-running adds another batch). Requires migrations applied so `call_types` and `apparatus_types` are populated. **`--user-id`** is required; **`--count`** defaults to **200** and is capped at **10_000**.

```bash
cd api
npm run seed:call-logs -- --user-id 2
npm run seed:call-logs -- --user-id 2 --count 500
```

Optional: set **`SEED`** to an integer for reproducible random data.

## Run Expo (web)

With the API running on port 3000:

```bash
cd app
npm install
npx expo install --fix
npx expo start --web
```

### API base URL

- Copy `app/.env.example` to `app/.env` and adjust `EXPO_PUBLIC_API_URL` if needed.
- **Android emulator**: use `http://10.0.2.2:3000` instead of `localhost`.
- **Physical device**: use your machine’s LAN IP, e.g. `http://192.168.1.x:3000`.

### Test login (Expo)

1. Ensure a user exists: register via the app, or `POST /auth/register`, or insert into MySQL only if the password is stored as a **bcrypt** hash compatible with the API (otherwise use register/login from the API).
2. Open the app — you should see **Log in** first. Enter email and password manually.
3. After sign-in, the **home** screen shows **total calls** and a **Menu** (create log, view all logs, account, and log out). Menu items other than log out are placeholders until those screens exist.

## Docker Compose

```bash
docker compose up --build
```

### API with hot reload (watch mode)

Use the dev overlay so the API runs `nest start --watch` and your host `./api` tree is bind-mounted (no image rebuild for normal code edits):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

- Uses [`api/Dockerfile.dev`](api/Dockerfile.dev) (full `npm install`, including devDependencies for the Nest CLI).
- `api_node_modules` volume keeps Linux `node_modules` separate from your host.
- First start may run `npm install` inside the container if `node_modules` is empty.
- `CHOKIDAR_USEPOLLING` helps file watching on Docker Desktop (macOS/Windows).

Production-style `docker compose up --build` (without the dev file) still uses the standard [`api/Dockerfile`](api/Dockerfile) and `node dist/main.js`.

- API: [http://localhost:3000/health](http://localhost:3000/health)
- **Web (Expo):** [http://localhost:8081](http://localhost:8081) — Metro dev server (`app/Dockerfile`). The browser loads the UI here and calls the API at `http://localhost:3000` (`EXPO_PUBLIC_API_URL`). The first `web` image build runs `npm install` and can take a few minutes.
- MySQL: `localhost:3306`, database `firefighter_log`, user `app` / `apppass`
- JWT for the API container is set in Compose (`JWT_SECRET`); override for real deployments.

`app/app.json` uses Metro for web **without** `output: "static"` so `expo start --web` does not require `expo-router`.

### Docker web: stale UI / old bundle after `git pull`

The **`web`** service bind-mounts **`./app`** so Metro serves **current** sources. You still need **`node_modules`** on the host inside `app/` (run `cd app && npm install` once). `CI` is set to `false` in Compose so Metro can watch files.

If the browser still shows an **old** home screen (e.g. health JSON and “coming next” text), the JS bundle is cached:

1. Hard-refresh the browser (Shift+Reload) or try a private window.
2. Restart Metro with a clean cache: `docker compose restart web` after pull, or run once with cache clear:  
   `docker compose run --rm --service-ports web npx expo start --web --host lan --port 8081 -c`
3. As a last resort, rebuild: `docker compose build web --no-cache && docker compose up -d web`.

## Incremental debugging

1. MySQL up, then API — confirm `GET /health`.
2. `POST /auth/register` (curl or Expo) — confirm a row in `users`.
3. Expo web — register and confirm you reach the signed-in screen.
