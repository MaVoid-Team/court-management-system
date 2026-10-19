# Local setup

How to run the Court Management System API on your machine. Endpoint details live in [API.md](API.md). A ready-made request set is in [Court_Management_API.postman_collection.json](Court_Management_API.postman_collection.json).

## Requirements

- Ruby 3.2.6 (see `.ruby-version`)
- PostgreSQL
- Redis (rate limiting and Sidekiq)
- Bundler

Meilisearch is optional. Full-text search stays off unless `MEILISEARCH_HOST` is set.

## First run

```bash
bundle install
bin/setup
bin/rails db:seed
```

`bin/setup` installs gems, prepares the database, and starts the API with `bin/dev` (Puma on port 3000). Pass `--skip-server` if you only want the database ready.

The API listens at `http://localhost:3000`. Health check: `GET /up`.

## Sample logins

After seeding:

| Role | Email | Password |
|------|-------|----------|
| Super admin | superadmin@courtmgmt.com | password123 |
| Branch admin (Downtown Sports Center) | admin.downtown@courtmgmt.com | password123 |
| Branch admin (Uptown Athletic Club) | admin.uptown@courtmgmt.com | password123 |

Use these with `POST /api/admin/login`, or import the Postman collection and run **Admin API → Auth → Login** first so the token is stored for later requests.

Seeds also create two branches, courts, packages, events, and a couple of bookings.

## Tests

```bash
bundle exec rspec
```

## Docker

`docker-compose.yml` can start PostgreSQL, Redis, Meilisearch, the API, Sidekiq, and the Next.js app in `frontend/`. The API is published on port 3090; the frontend on 3091. That path expects a local `.env` and `config/master.key` — do not commit either.

## Deploy

The repo ships a `Dockerfile`, `Dockerfile.frontend`, and Kamal (`kamal` in the Gemfile, plus `deploy/`). Keep secrets in environment variables; the container filesystem is ephemeral.
