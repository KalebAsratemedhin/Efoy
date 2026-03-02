# Efoy Hospital Appointment Manager

A modern, full-stack hospital appointment management system designed to streamline doctor-patient interactions, appointment scheduling, and healthcare administration. Built with **FastAPI** (Python) for the backend and **React + Vite + TypeScript** for the frontend.

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Backend Setup (FastAPI)](#backend-setup-fastapi)
  - [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
  - [Docker Compose (Recommended)](#docker-compose-recommended)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Main Screens & Functionality](#main-screens--functionality)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## Features
- **User Authentication**: JWT-based, supports patients, doctors, and admins
- **Doctor & Patient Dashboards**: Role-based dashboards with analytics, reminders, and quick actions
- **Appointment Booking**: Real-time slot availability, booking, and management
- **Virtual Video Consultations**: Integrated video calling using Stream Video API for remote appointments
- **Digital Prescription System**: Complete prescription management with digital signatures
- **Doctor Applications**: Doctors can apply, admins can review and approve
- **Ratings & Comments**: Patients can rate and comment on doctors
- **Profile Management**: Update info, upload profile pictures (Cloudinary)
- **Admin Panel**: Manage users, doctors, and system analytics
- **Responsive UI**: Modern, mobile-friendly design with Framer Motion animations
- **API Rate Limiting & Security**: Robust validation, role-based access, and rate limiting

---

## Architecture
```
[ React + Vite Frontend ]  <---->  [ FastAPI Backend ]  <---->  [ MongoDB ]
                                    |
                                    v
                            [ Stream Video API ]
```
- **Frontend**: React, Redux Toolkit, TailwindCSS, Chart.js, FullCalendar, Framer Motion, Stream Video SDK
- **Backend**: FastAPI, Beanie ODM, MongoDB, Pydantic, Cloudinary, JWT, Stream Video integration
- **Containerization**: Docker & Docker Compose for local development
- **External Services**: Stream Video for real-time video calling, Cloudinary for file storage

---

## Tech Stack
- **Frontend**: React 18, Vite, TypeScript, Redux Toolkit, TailwindCSS, Chart.js, FullCalendar, Framer Motion, Stream Video React SDK, React Signature Canvas, jsPDF
- **Backend**: FastAPI, Beanie (MongoDB ODM), Pydantic, Uvicorn, Cloudinary, JWT, PyJWT, Stream Video integration, Pytest
- **Database**: MongoDB
- **DevOps**: Docker, Docker Compose
- **External APIs**: Stream Video API for video calling

---

## Getting Started

### Backend Setup (FastAPI)
1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Efoy_Hospital_Appointment_Manager/server
   ```
2. **Create a virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
4. **Configure environment variables**
   - Copy `.env.template` to `.env` and fill in your values
   - **Required**: MongoDB URI, JWT secret, Cloudinary credentials
   - **New**: Stream Video API key and secret for video calling
5. **Run the app**
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup (React + Vite)
1. **Install dependencies**
   ```bash
   cd ../client
   npm install
   ```
2. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000)

### Docker Compose (Recommended)
Run both backend and MongoDB with one command:
```bash
cd server
docker-compose up --build
```
- FastAPI: [http://localhost:8000](http://localhost:8000)
- MongoDB: [localhost:27017](localhost:27017)

---

## Environment Variables
- **Backend**: See `server/.env.template` for required variables
  - **Core**: MongoDB URI, JWT secret, Cloudinary credentials
  - **New**: `STREAM_API_KEY` and `STREAM_API_SECRET` for video calling
- **Frontend**: Add any required API URLs or keys to `.env` in `client` if needed

---

## API Overview
- **Base URL**: `http://localhost:8000/api/v1`
- **Authentication**: JWT Bearer tokens
- **Rate Limiting**: 60 req/min, 1000 req/hour
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### Key Endpoints
- `POST /auth/signup` – Register user (patient/doctor)
- `POST /auth/signin` – Login
- `GET /user/current-user` – Get current user info
- `GET /doctor/` – List/search doctors
- `POST /booking/` – Book appointment (supports in-person/virtual)
- `GET /booking/` – List user bookings
- `POST /rating/` – Rate a doctor
- `POST /comment/` – Comment on a doctor
- `POST /doctor-application/` – Apply as doctor
- `PUT /user/{id}` – Update user info

### New Video Call Endpoints
- `POST /video/generate-token` – Generate Stream Video user token
- `POST /video/join-call/{booking_id}` – Join video consultation
- `POST /video/end-call/{booking_id}` – End video consultation
- `GET /video/call-status/{booking_id}` – Get call status

### New Prescription Endpoints
- `POST /prescription/` – Create prescription (doctors only)
- `GET /prescription/patient` – Get patient prescriptions
- `GET /prescription/doctor` – Get doctor's prescriptions
- `GET /prescription/{id}` – Get specific prescription
- `PUT /prescription/{id}` – Update prescription

---

## Main Screens & Functionality
### Frontend
- **Landing Page**: Welcome, about, contact, video consultation features
- **Auth**: Signup, Signin, Google OAuth, Email Verification
- **Dashboards**:
  - **Patient**: Bookings, favorites, reminders, reports, recent prescriptions
  - **Doctor**: Appointments, stats, profile, reminders, recent prescriptions
  - **Admin**: System stats, manage doctors, reports, user management
- **Doctors**: Search, view details, book, rate, comment
- **Appointments**: List, details, calendar view, video call integration
- **Video Calls**: Real-time video consultations using Stream Video
- **Prescriptions**: Complete prescription management with digital signatures
- **Settings**: Profile, preferences, profile picture
- **Error Handling**: User-friendly error and loading states

### Backend
- **Role-based Access**: Patients, doctors, admins
- **Secure File Uploads**: Profile pictures (Cloudinary)
- **Video Call Integration**: Stream Video API for remote consultations
- **Prescription Management**: Digital prescriptions with signature validation
- **Database Indexes**: Optimized for performance
- **Comprehensive Validation**: Pydantic schemas
- **Rate Limiting & Security**: Prevents abuse

---

## New Features

### 🎥 Virtual Video Consultations
- **Real-time Video Calls**: Integrated with Stream Video API for high-quality video consultations
- **Appointment Types**: Support for both in-person and virtual appointments
- **Call Management**: Join, end, and track video call status
- **Permission Control**: Only authorized users can join specific calls
- **Call Analytics**: Track call duration and timing

### 💊 Digital Prescription System
- **Complete Prescription Management**: Create, view, and manage medical prescriptions
- **Digital Signatures**: Doctors must digitally sign prescriptions using signature canvas
- **PDF Generation**: Download prescriptions as legally-compliant PDFs
- **Role-based Access**: Doctors create, patients view and download
- **Prescription History**: Track all prescriptions with status and expiry dates
- **Medication Management**: Support for multiple medications per prescription

### 🔐 Enhanced Security & Compliance
- **Digital Signatures**: Legally valid digital signatures for prescriptions
- **Audit Trail**: Track prescription creation and modifications
- **Role Validation**: Ensure only authorized users can perform actions
- **Data Integrity**: Comprehensive validation and error handling

---

## Testing
- **Backend**: Run tests with
  ```bash
  cd server
  pytest app/tests/ -v
  ```
- **Frontend**: Add tests as needed (Jest/React Testing Library recommended)

---

## Contributing
1. Fork the repo & create a feature branch
2. Make your changes (with clear commits)
3. Add/Update tests as needed
4. Open a Pull Request with a clear description

---

## License
This project is licensed under the MIT License.
