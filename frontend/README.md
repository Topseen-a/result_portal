# Result Portal — Frontend

React (Vite) + Tailwind CSS v4 frontend for the Result Portal Django API.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy the env file and point it at your running Django backend:
   ```
   cp .env.example .env
   ```
   By default it expects the API at `http://127.0.0.1:8000/api`. Change
   `VITE_API_BASE_URL` in `.env` if your backend runs somewhere else
   (e.g. `http://localhost:8000/api` if you're using the Dockerized backend).

3. Start the dev server:
   ```
   npm run dev
   ```
   It runs on `http://localhost:5173` by default.

## Backend requirements

This frontend depends on a few things that need to be added to the Django
backend alongside it:

- `POST /api/auth/token/refresh/` (DRF SimpleJWT's built-in `TokenRefreshView`)
- `GET /api/me/` returning the logged-in user's profile, including their
  `student` or `staff` sub-profile
- `GET /api/session/` returning `id`, `semester`, and `is_current` on each
  session (not just `name`/`year`/`start_date`)

You also need to allow this frontend's origin in the backend's CORS settings.
In the backend's `.env`:
```
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Every list endpoint (departments, courses, sessions, registrations, results)
returns DRF's paginated shape (`{count, next, previous, results}`) since the
backend has `DEFAULT_PAGINATION_CLASS` set globally — the API layer here
(`src/api/client.js`'s `unwrapResults`) already accounts for that, so pages
just get a plain array back.

## Structure

- `src/api/` — API client (JWT storage + auto-refresh) and endpoint functions
- `src/context/AuthContext.jsx` — auth state, login/logout, profile caching
- `src/components/` — shared UI kit, sidebar, top bar, icons
- `src/layouts/DashboardLayout.jsx` — sidebar + top bar shell for authenticated pages
- `src/pages/` — one file per route

## Roles

The UI adapts based on the logged-in user's `role`:
- **student** — dashboard, browse/register courses, view own results, GPA/CGPA
- **staff** — dashboard, add courses, upload and publish results
- **admin** — same view as staff for now; department/session management still
  happens through the Django admin panel

## Known gaps / next steps

- No student self-signup screen yet (enrollment still goes through the
  `/api/student-enroll/` endpoint directly, e.g. via the API or a future signup page)
- No password reset flow
- No course-drop confirmation dialog (drops immediately on click)
