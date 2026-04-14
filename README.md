# Job Portal (MERN)

This repository contains a full-stack Job Portal application built with MongoDB, Express, React, and Node.js.

## Project Modules

- job-portal-client: Frontend application (React + Vite)
- job-portal-server: Backend API (Express + MongoDB)

## Main Features

- User and company authentication
- Job posting, update, and deletion for company accounts
- Job search and filtering for users
- Job application flow with confirmation email
- Subscription-based job alert emails
- Profile page with tabs and my applications

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, React Router
- Backend: Node.js, Express.js, MongoDB, JWT, Nodemailer

## Local Setup

### 1) Clone

```bash
git clone https://github.com/your-username/your-repo.git
cd Mern_JobPortal-main
```

### 2) Backend setup

```bash
cd job-portal-server
npm install
```

Create job-portal-server/.env:

```env
PORT=5000
DB_USER=your_db_user
DB_PASSWORD=your_db_password
CLIENT_URL=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_without_spaces
MAIL_FROM="Job Portal <your_email@gmail.com>"
```

Run backend:

```bash
node index.js
```

### 3) Frontend setup

```bash
cd ../job-portal-client
npm install
```

Create job-portal-client/.env:

```env
VITE_API_URL=http://localhost:5000
```

Run frontend:

```bash
npm run dev
```

## Branch Workflow for Submission

Branch names used in this task:

- main
- jobportal
- Ayush_sharma(backend)

Expected workflow:

1. Keep main minimal (README only).
2. Work in personal branch Ayush_sharma(backend).
3. Open pull request from Ayush_sharma(backend) to jobportal.
4. After merge, jobportal will collect project work.

## API Notes

- POST /post-job
- PATCH /update-job/:id
- DELETE /job/:id
- POST /apply-job/:id
- GET /apply-job-status/:id
- GET /my-applications
- POST /subscribe-job-alerts
- POST /import-jobs
