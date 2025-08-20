# Points Manager (Neon + Netlify Identity)

## 1) Create Neon DB
- Create a Neon project (Postgres).
- Copy the **connection string**.
- In Neon SQL editor, run `schema.sql` from this folder.

## 2) Set env var in Netlify
Netlify Dashboard → Site settings → Build & deploy → Environment
- Add `NEON_DATABASE_URL` = your Neon connection string

## 3) Install dependency
Add to your repo:
- `package.json` (provided) with `@neondatabase/serverless`
- `netlify.toml` (provided)

Commit & deploy so functions install and bundle the dependency.

## 4) Identity: roles & webhooks (optional)
- Enable Identity
- Give E-Board users the `eboard` role
- (Optional) Set an Identity webhook to POST to `/.netlify/functions/sync-user` on signup/login,
  or rely on the client call in points-manager.js after login.

## 5) Use it
- Visit `/eboard-dashboard/points-manager.html` (must be logged in with `eboard` role)
- Leaderboard is public via `/.netlify/functions/leaderboard` and loads on that page
- Adjust points using the forms. Only `eboard` can call `/.netlify/functions/points`.

