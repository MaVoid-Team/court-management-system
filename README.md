# Court Management System

A Rails API for booking sports courts across multiple club branches — pick a free hour, reserve it, and run the desk from one place.

## Who it's for

Club owners, branch managers, and anyone building a booking app for venues with more than one location. If you run padel or tennis courts and you're tired of double-booked hours, this is the backend.

## What you can do

- Check a court's free hours for a given day and lock in a slot before it disappears
- Run each location on its own — courts, prices, opening hours, and staff stay scoped to the branch
- Sell hour packages, publish events, and let players join a tournament
- Block a court for maintenance, cancel a reservation, or mark a payment as paid
- Give a branch admin access to just their site; keep a super admin over the whole club

## Try it

- **[API Reference](docs/API.md)** — auth, endpoints, params, and response shapes
- **[Postman collection](docs/Court_Management_API.postman_collection.json)** — import it, then run **Admin API → Auth → Login** so the token sticks for the rest of the requests

```bash
# Ruby 3.2.6 and PostgreSQL
bin/setup
bin/rails db:seed   # sample branches, courts, and bookings
# API: http://localhost:3000
```

Full setup, sample logins, tests, and Docker notes live in **[docs/SETUP.md](docs/SETUP.md)**.

## How it works

Public routes cover availability, bookings, packages, events, and reviews — no login required to reserve a court. Staff use a token from the admin login endpoint. Super admins see every branch; branch admins stay in theirs. Search is optional when you turn on Meilisearch.

---

Built by [Ziad Ahmed](https://github.com/Ziad-NasrEldin) at [MaVoid](https://mavoid.com).

[Website](https://mavoid.com) · [LinkedIn](https://linkedin.com/in/ziad-ahmed-634202332) · [GitHub](https://github.com/Ziad-NasrEldin)
