# Result Portal

A full-stack academic result management system. Admins set up departments, courses and sessions, staff enter results, and students register for courses and see their grades with GPA and CGPA calculated automatically.

**Live demo:** https://result-portal-rs.vercel.app/
**API docs (Swagger):** https://result-portal-3vh0.onrender.com/swagger/

> Both services run on free tiers, so the first request after a period of inactivity can take 30 to 60 seconds while the server wakes up.

## Features

- Role-based access for admins, staff and students
- JWT authentication with refresh token rotation and blacklisting
- Departments, courses, academic sessions and semesters
- Student and staff profiles, with matric number generation
- Course registration per session
- Result entry by staff, with grades and grade points computed on the server
- GPA and CGPA calculation
- Paginated REST API with interactive Swagger documentation
- React dashboard with a separate view for each role

## Tech stack

| Layer | Tools |
| --- | --- |
| Backend | Django, Django REST Framework, SimpleJWT, drf-yasg |
| Database | PostgreSQL (Neon in production) |
| Frontend | React, Vite, Tailwind CSS, React Router |
| Tooling | uv, Docker, Docker Compose, WhiteNoise, Gunicorn |
| Hosting | Render (API), Vercel (frontend), Neon (database) |

## Repository layout

```
result_portal/
├── backend/    Django REST API
├── frontend/   React app
└── .github/    CI workflow (backend tests)
```

## Running locally

### Backend

```bash
cd backend
cp .env.example .env     # then fill in your values
uv sync
uv run python manage.py migrate
uv run python manage.py createsuperuser
uv run python manage.py runserver
```

The API is at http://127.0.0.1:8000/ and Swagger is at http://127.0.0.1:8000/swagger/.

To use Docker instead, run `docker compose up --build` from inside `backend/`. Then run `docker compose exec web uv run python manage.py migrate` in a second terminal.

### Frontend

```bash
cd frontend
cp .env.example .env     # VITE_API_BASE_URL=http://127.0.0.1:8000/api
npm install
npm run dev
```

The app is at http://localhost:5173.

## Environment variables (backend)

| Variable | Purpose |
| --- | --- |
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True` for local development only |
| `ALLOWED_HOSTS` | Comma-separated hostnames |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend URLs |
| `FRONTEND_URL` | Frontend base URL, used for password reset links in emails |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` | SMTP settings for outgoing mail (password reset) |
| `DATABASE_URL` | Postgres connection string (used if set) |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | Used when `DATABASE_URL` is not set |

The frontend needs one variable, `VITE_API_BASE_URL`. Vite bakes it in at build time, so redeploy after changing it.

## Running tests

```bash
cd backend
uv run python manage.py test
```

## Deployment

The backend is a Docker web service on Render with its root directory set to `backend`. The frontend is a Vercel project with its root directory set to `frontend`. Both deploy automatically on pushes to `main`.

## Author

Built by [Temitope](https://github.com/Topseen-a).