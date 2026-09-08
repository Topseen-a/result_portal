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