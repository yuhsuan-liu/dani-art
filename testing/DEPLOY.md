# Render + Production Setup

## Where things live (read this first)

| Thing | Hosted on | NOT on Render |
|-------|-----------|---------------|
| Database (artwork, furniture, orders) | **Supabase** | — |
| Images (Unsplash URLs + uploads) | **Supabase Storage** | — |
| Google login | **Supabase Auth** | — |
| FastAPI backend (optional API) | **Render** | — |
| React website | **GitHub Pages** | — |

**Render does not host your database.** If GitHub Pages shows no photos or login goes to `placeholder.supabase.co`, the fix is **GitHub Actions secrets** (frontend) and **Supabase seed data** — not Render alone.

---

## Step 1 — Render: Blueprint vs New Web Service?

Use **Blueprint** (recommended):

1. [render.com](https://render.com) → sign in with GitHub  
2. **New +** → **Blueprint**  
3. Connect **`yuhsuan-liu/dani-art`**  
4. Render reads root **`render.yaml`** and creates **`dani-art-api`** automatically  

Use **Web Service** only if Blueprint fails — then set manually:

- Root directory: `backend`  
- Build: `pip install -r requirements.txt`  
- Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`  

**Blueprint = one click from repo config. Web Service = manual copy-paste of the same settings.**

---

## Step 2 — Render environment variables

| Variable | Value |
|----------|-------|
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_KEY` | Supabase **service_role** key (secret) |
| `FRONTEND_URL` | `https://yuhsuan-liu.github.io` |

Deploy → test: `https://YOUR-SERVICE.onrender.com/health`

---

## Step 3 — GitHub Actions secrets (fixes login + live data)

**Repo → Settings → Secrets and variables → Actions**

| Secret | Value |
|--------|-------|
| `VITE_SUPABASE_URL` | Same Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase **anon public** key |
| `VITE_API_URL` | Render URL from step 2 (or `http://localhost:8000` until Render is up) |

Then **re-run** “Deploy Frontend to GitHub Pages” (or push to `main`).

Without these secrets, the built site uses `placeholder.supabase.co` and **Google login will fail**.

---

## Step 4 — Supabase seed data (stock photos in DB)

Run in Supabase **SQL Editor**:

`supabase/migrations/001_initial_schema.sql`  
then `supabase/migrations/002_permissions_and_seed.sql`

Until seed runs, the site shows **local Unsplash demo** content when the DB is empty. After Dani adds real artwork, only real rows appear.

---

## Step 5 — Supabase Auth (Google OAuth)

**Authentication → URL Configuration**

| Setting | Value |
|---------|-------|
| Site URL | `https://yuhsuan-liu.github.io/dani-art/` |
| Redirect URLs | `https://yuhsuan-liu.github.io/dani-art/` |
| | `http://localhost:5173/` |

**Google Cloud Console:** authorized origin `https://yuhsuan-liu.github.io`

---

## Step 6 — Dani's artist account

After first Google login:

```sql
INSERT INTO users (email, name, role)
VALUES ('dani@gmail.com', 'Dani', 'artist')
ON CONFLICT (email) DO UPDATE SET role = 'artist';
```

Use his real Gmail.

---

## Step 7 — Verify

```bash
cd backend && source venv/bin/activate && python ../testing/run_crud_tests.py
```

Live site: https://yuhsuan-liu.github.io/dani-art/
