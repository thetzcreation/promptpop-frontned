# PromptPop — Trending Prompt Library


A curated, copy-paste library of trending AI image/video prompts for creators.
Originally built on Emergent; this is the self-hostable bundle with the
Emergent-only bits removed and the known bugs fixed (see "What changed" below).

## Stack

- **Frontend:** React 19 + React Router 7, CRACO, Tailwind CSS
- **Backend:** FastAPI + Motor (async MongoDB driver)
- **Database:** MongoDB

## Project structure

```
promptpop/
├── backend/
│   ├── server.py          # FastAPI app, models, routes, seed data
│   ├── requirements.txt
│   └── .env.example       # copy to .env and fill in
└── frontend/
    ├── src/
    │   ├── components/    # PromptCard, PromptModal, Filters, Navbar, etc.
    │   ├── pages/          # LibraryPage (/), AdminPage (/admin)
    │   └── lib/             # api.js, style-colors.js, errors.js
    ├── package.json
    └── .env.example        # copy to .env and fill in
```

---

## 1. Local setup

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env`:
- `MONGO_URL` — a local MongoDB (`mongodb://localhost:27017`) or a free
  hosted one (see below)
- `ADMIN_TOKEN` — **set this to a long random string.** If you leave it
  blank, the server will generate a temporary one on every restart and
  print it to the console log — fine for quick testing, not for real use.
  Generate one with:
  ```bash
  python3 -c "import secrets; print(secrets.token_urlsafe(24))"
  ```

Run it:
```bash
uvicorn server:app --reload --port 8001
```

The app seeds 12 starter prompt cards automatically on first run (only if
the `prompt_cards` collection is empty).

### Frontend

```bash
cd frontend
yarn install      # or: npm install
cp .env.example .env
```

Edit `.env` — set `REACT_APP_BACKEND_URL` to wherever your backend is
running (`http://localhost:8001` for local dev).

Run it:
```bash
yarn start        # or: npm start
```

Visit `http://localhost:3000`. Admin panel is at `/admin` — log in with
the `ADMIN_TOKEN` you set above.

---

## 2. Free hosting (no Emergent needed)

A solid free-tier path:

| Piece     | Where                  | Notes |
|-----------|-------------------------|-------|
| Database  | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free M0 cluster | Get a `mongodb+srv://...` connection string |
| Backend   | [Render](https://render.com) free web service, or [Railway](https://railway.app) | Point it at this `backend/` folder |
| Frontend  | [Vercel](https://vercel.com) or [Netlify](https://netlify.com) | Point it at this `frontend/` folder |

### Steps

1. **Database:** create a free MongoDB Atlas cluster, create a database
   user, allow network access from anywhere (or your host's IPs), and
   copy the connection string.
2. **Backend:** push the `backend/` folder to its own GitHub repo (or a
   subfolder of one). On Render/Railway, create a new Web Service from
   that repo:
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn server:app --host 0.0.0.0 --port $PORT`
   - Environment variables: `MONGO_URL`, `DB_NAME`, `ADMIN_TOKEN`, and
     `CORS_ORIGINS` (set this to your frontend's deployed URL once you
     have it, e.g. `https://promptpop.vercel.app`)
3. **Frontend:** push `frontend/` to GitHub, import it into Vercel/Netlify:
   - Build command: `yarn build` (or `npm run build`)
   - Output directory: `build`
   - Environment variable: `REACT_APP_BACKEND_URL` = your deployed
     backend URL from step 2 (no trailing slash)
4. Redeploy the backend once you know the frontend's final URL, so
   `CORS_ORIGINS` is locked down instead of `*`.

---

## 3. What changed from the original Emergent build

These were identified while reviewing the original code and have been
fixed in this bundle:

1. **Critical bug fixed:** creating/editing a prompt in `/admin` used to
   crash the whole React app. FastAPI returns validation errors (422) as
   an *array of objects*, and the old code passed that straight into
   `toast.error()`, which React can't render. Added `lib/errors.js` to
   safely turn any error shape into a string, used it everywhere errors
   are shown, fixed the hotness number field so it can't become `NaN`,
   and wrapped the admin page in an error boundary as a safety net.
2. **Security:** removed the hardcoded fallback admin token
   (`promptpop-admin-2026`) and the token hint that was printed directly
   in the admin login form. The backend now requires `ADMIN_TOKEN` in
   `.env`, or generates and logs a temporary one if you don't set it.
3. **Removed Emergent-only code:** the `@emergentbase/visual-edits`
   dev dependency and the `[data-debug-wrapper]` CSS rules (used by
   Emergent's in-browser visual editor) are gone — not needed for
   self-hosting.
4. **Self-hosting-ready images:** 5 of the 12 seed cards originally used
   reference images hosted on Emergent's job-specific CDN, which would
   stop working once the Emergent project is gone. Swapped to stable
   Unsplash URLs. Replace any of these via the admin panel with your own
   images whenever you like.
5. **Trimmed dependencies:** `requirements.txt` and `package.json` were
   pared down to only what the app actually imports (the original
   scaffold included a lot of unused boilerplate — boto3, pandas, the
   full shadcn/ui Radix component set, etc., none of which any custom
   file in this app actually uses).
6. **"Drop a prompt" button:** previously linked out to `emergent.sh`
   (a leftover placeholder, not a real feature — this app has no user
   submissions/auth in v1). Changed to a `mailto:` link as a safe
   default — update the address in `Navbar.jsx`, or build a real
   submission flow later if you want one.

## 4. Known limitations (not fixed, just flagged)

- Admin auth is a single shared token stored in the browser's
  `localStorage`, not real per-user accounts. Fine for a solo curator;
  don't share the token if it's at all sensitive.
- No rate-limiting on `/api/admin/verify` — someone could brute-force
  the token if they really wanted to. Low risk for a small personal
  project, but worth knowing.
- There's no real "submit your own prompt" feature yet — see point 6
  above.
