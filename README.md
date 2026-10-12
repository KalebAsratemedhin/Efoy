# Efoy — Your Hospital Companion

Efoy is a modern hospital companion that connects patients with doctors for appointments, video consultations, prescriptions, and ongoing care—simple, secure, and human.

Built with **React + Vite + TypeScript** on the frontend and **FastAPI** on the backend, with **MongoDB** for persistence.

---

## Table of contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [API overview](#api-overview)
- [Main screens](#main-screens)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **Authentication** — JWT auth for patients, doctors, and admins (email verification, Google OAuth)
- **Role-based dashboards** — Stats, reminders, unpaid appointments, recent prescriptions
- **Appointment booking** — Real-time slot availability, in-person and virtual visits
- **Queue & calendar** — Doctor queue view (upcoming from now), list and calendar modes
- **Video consultations** — Stream Video–powered remote appointments
- **Digital prescriptions** — Create, sign, view, and download prescriptions
- **Payments** — Booking payment flow with status tracking
- **Doctor discovery** — Public doctors directory and profiles; authenticated app shell with sidebar
- **Doctor board & Q&A** — Posts, patient questions, answers, and reactions
- **Reviews** — Ratings and comments on doctor profiles
- **Notifications** — Real-time updates over WebSocket
- **Care history** — Prior appointments and prescriptions for a patient–doctor pair
- **Admin tools** — System stats and doctor management

---

## Architecture

```
[ React + Vite Client ]  <---->  [ FastAPI API ]  <---->  [ MongoDB ]
                                      |
                                      +----> Stream Video
                                      +----> Cloudinary
                                      +----> Payment provider
```

| Layer | Role |
|--------|------|
| **Client** (`client/`) | UI, Redux Toolkit Query, routing, dashboards |
| **Server** (`server/`) | REST API, auth, bookings, video, prescriptions, notifications |
| **MongoDB** | Primary data store (Beanie ODM) |

---

## Tech stack

- **Frontend:** React 18, Vite, TypeScript, Redux Toolkit, Tailwind CSS, Framer Motion, FullCalendar, Chart.js, Stream Video SDK
- **Backend:** FastAPI, Beanie, Pydantic, Uvicorn, JWT, Cloudinary, Stream Video
- **Database:** MongoDB
- **DevOps:** Docker, Docker Compose

---

## Getting started

### Backend (FastAPI)

```bash
cd server
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env        # fill in values
uvicorn app.main:app --reload
```

API: [http://localhost:8000](http://localhost:8000) · Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend (React + Vite)

```bash
cd client
npm install
npm run dev
```

App: [http://localhost:3000](http://localhost:3000)

Set `VITE_BACKEND_URL` in `client/.env` to your API base (for example `http://localhost:8000/api/v1`).

### Docker Compose (API + MongoDB)

```bash
cd server
docker-compose up --build
```

- FastAPI: [http://localhost:8000](http://localhost:8000)
- MongoDB: `localhost:27017`

---

## Environment variables

**Backend** — see `server/env.example` (or `.env.template` if present):

- MongoDB URI, JWT secret
- Cloudinary credentials (profile images)
- Stream Video API key & secret
- Payment / email provider keys as required

**Frontend** — `client/.env`:

- `VITE_BACKEND_URL` — API base URL

---

## API overview

- **Base URL:** `http://localhost:8000/api/v1`
- **Auth:** JWT Bearer tokens
- **Swagger:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Core endpoints

| Area | Examples |
|------|----------|
| Auth | `POST /auth/signup`, `POST /auth/signin` |
| Users | `GET /user/current-user` |
| Doctors | `GET /doctor/`, `GET /doctor/{id}` |
| Bookings | `POST /booking/`, `GET /booking/` |
| Ratings / comments | `POST /rating/`, `POST /comment/` |
| Video | `POST /video/join-call/{booking_id}`, … |
| Prescriptions | `POST /prescription/`, `GET /prescription/patient`, … |
| Notifications | `GET /notification/`, WebSocket feed |
| Board / Q&A | Doctor posts, questions, answers, reactions |

---

## Main screens

| Area | What you get |
|------|----------------|
| **Landing** | Brand home, featured top doctors, CTAs |
| **Doctors** | Public browse & profiles; signed-in users get the app sidebar |
| **Dashboards** | Patient, doctor, and admin overviews |
| **Appointments** | List, calendar, doctor queue, detail & care history |
| **Video call** | Join virtual visits |
| **Prescriptions** | Create (doctors), view & download |
| **Settings** | Profile, doctor profile, public profile link |
| **Notifications** | In-app bell and real-time toasts |

---

## Contributing

1. Fork and create a feature branch  
2. Make focused commits  
3. Open a pull request with a clear summary  

---

## License

MIT
