# Result Portal — Backend

A Django REST API for managing academic results at a Nigerian tertiary institution — student and staff enrollment, course registration, result upload/publishing, and automatic GPA/CGPA calculation on the standard 5-point grading scale.

Live API: `https://result-portal-3vh0.onrender.com/api`
Interactive docs (Swagger): `https://result-portal-3vh0.onrender.com/swagger/`

Frontend repo: [result-portal-frontend](#) — React + Vite client for this API.

## Tech stack

- **Django 6.0** + **Django REST Framework**
- **PostgreSQL** ([Neon](https://neon.com) in production, local Postgres for development)
- **JWT authentication** via `djangorestframework-simplejwt` (access/refresh with rotation + blacklist)
- **drf-yasg** for auto-generated Swagger/OpenAPI docs
- **uv** for dependency management
- **WhiteNoise** for static file serving in production
- **Gunicorn** as the production WSGI server
- Deployed on **Render**, with **Docker** support for local containerized development

## Features

- Role-based accounts: **admin**, **staff**, **student** — each with a distinct permission set
- Student self-enrollment (open) and staff enrollment (admin-only)
- Department and course management, scoped by department
- Academic session management (year, semester, current-session flag)
- Course registration with duplicate-registration and semester-mismatch protection
- Result upload restricted to staff, with a separate publish/unpublish step before students can see a grade
- Automatic grade and grade-point calculation from a numeric score
- Per-session GPA and cumulative CGPA endpoints, with ownership checks (a student can only view their own)
- CORS configured for a separate frontend origin

## Project structure

## Roles

| Role    | Can do                                                                 |
|---------|-------------------------------------------------------------------------|
| Student | Register/drop courses, view own published results and GPA/CGPA          |
| Staff   | Create courses, upload and publish results for their students           |
| Admin   | Everything staff can do, plus create departments, sessions, staff accounts, and manage everything via `/admin/` |

## Local setup

1. **Install dependencies** (requires [uv](https://docs.astral.sh/uv/)):
```bash
   uv sync
```

2. **Set up your environment**. Copy the template and fill in real values:
```bash
   cp .env.example .env
```
   At minimum you need `SECRET_KEY`, `DEBUG=True`, and either a local Postgres connection (`DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`) or a `DATABASE_URL` (e.g. from [Neon](https://neon.com)'s free tier).

3. **Run migrations**:
```bash
   uv run python manage.py migrate
```

4. **Create an admin account**:
```bash
   uv run python manage.py createsuperuser
```

5. **Start the dev server**:
```bash
   uv run python manage.py runserver
```
   API docs: `http://127.0.0.1:8000/swagger/` · Admin: `http://127.0.0.1:8000/admin/`

### Running with Docker instead

```bash
docker compose up --build
```
Then, in a separate terminal, run migrations and create a superuser inside the running container:
```bash
docker compose exec web uv run python manage.py migrate
docker compose exec web uv run python manage.py createsuperuser
```

## Environment variables

| Variable                | Required | Notes                                                              |
|--------------------------|----------|---------------------------------------------------------------------|
| `SECRET_KEY`             | Yes      | Generate a fresh one per environment; never reuse across environments |
| `DEBUG`                  | Yes      | `True` locally, `False` in production                              |
| `DATABASE_URL`           | One of these | Full Postgres connection string (e.g. from Neon); takes priority over the individual `DB_*` vars if set |
| `DB_NAME`/`DB_USER`/`DB_PASSWORD`/`DB_HOST`/`DB_PORT` | | Used only if `DATABASE_URL` isn't set                              |
| `ALLOWED_HOSTS`          | Yes      | Comma-separated hostnames, e.g. `localhost,127.0.0.1` or your Render domain |
| `CORS_ALLOWED_ORIGINS`   | Yes      | Comma-separated frontend origin(s) allowed to call this API         |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` | No | For outgoing mail; can be left blank in development |

## Key API endpoints

| Endpoint                              | Method | Access          |
|-----------------------------------------|--------|-----------------|
| `/api/student-enroll/`                | POST   | Public          |
| `/api/staff-enroll/`                  | POST   | Admin           |
| `/api/auth/login/`                    | POST   | Public          |
| `/api/auth/token/refresh/`            | POST   | Public          |
| `/api/me/`                            | GET    | Authenticated   |
| `/api/departments/`                   | GET/POST | GET public, write admin-only |
| `/api/departments/{code}/course/`     | GET/POST | GET authenticated, write staff/admin |
| `/api/session/`                       | GET/POST | GET authenticated, write admin-only |
| `/api/course-registration/`           | GET/POST/DELETE | Authenticated (students act on their own) |
| `/api/results/`                       | GET/POST/PATCH | GET authenticated, write staff-only |
| `/api/gpa/{matric_number}/{session_id}/` | GET | Self, or staff/admin |
| `/api/cgpa/{matric_number}/`          | GET    | Self, or staff/admin |

Full interactive documentation with request/response schemas is available at `/swagger/`.

## Deployment

- **Database**: [Neon](https://neon.com) (free tier, serverless Postgres)
- **Backend**: [Render](https://render.com) (free tier, Docker-based web service)
- Static files are served by WhiteNoise directly from the Django process — no separate static file host needed
- `CORS_ALLOWED_ORIGINS` must include the deployed frontend's URL, and `ALLOWED_HOSTS` must include the backend's own Render hostname
