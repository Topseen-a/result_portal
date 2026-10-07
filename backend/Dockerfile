FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files first
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen

# Copy the project
COPY . .

EXPOSE 8000

CMD ["sh", "-c", "uv run python manage.py migrate && uv run python manage.py collectstatic --noinput && uv run gunicorn result_portal.wsgi:application --bind 0.0.0.0:$PORT"]