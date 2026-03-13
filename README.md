# Church Attendance Management App

Full-stack church attendance management web application.

## Tech Stack

- **Frontend**: React (Vite, TypeScript), Tailwind CSS, Axios, React Router
- **Backend**: Node.js, Express, Prisma ORM, SQLite, JWT auth

## Project Structure

- `client` – React frontend
- `server` – Express API + Prisma + SQLite

## Prerequisites

- Node.js 18+
- npm

## Backend Setup (`server`)

```bash
cd server
npm install

# create .env (or edit existing) with at least:
# DATABASE_URL="file:./data/attendance.db"
# PORT=4000
# JWT_SECRET="your-secret"
# ADMIN_EMAIL="admin@church.local"
# ADMIN_PASSWORD="changeme123"

# migrate and generate Prisma client
npm run prisma:migrate

# seed default members
npm run prisma:seed

# start API (http://localhost:4000)
npm run dev
```

## Frontend Setup (`client`)

```bash
cd client
npm install

# create .env file based on .env.example
cp .env.example .env

# start dev server (http://localhost:5173)
npm run dev
```

By default the frontend expects `VITE_API_URL=http://localhost:4000`.

## Login

- **Email**: value of `ADMIN_EMAIL` in `server/.env` (default `admin@church.local`)
- **Password**: value of `ADMIN_PASSWORD` in `server/.env` (default `changeme123`)

## Core Features

- **Member Management** – add, edit, delete members with fields:
  - Full Name, Phone, Email, Family Name, Join Date
- **Weekly Attendance** – mobile-friendly list of members, mark as Present/Absent per date (no duplicates for same date)
- **Reports**:
  - Monthly, last 3 months, and custom date range
  - Shows member name, total present, total absent, attendance percentage
  - Export as **CSV** or **PDF**
- **Dashboard** – total members, today’s attendance count, and overall attendance percentage.

## Deploy to Vercel

The **frontend** deploys well on Vercel. The **backend** uses SQLite (file-based), and Vercel’s serverless environment does not persist files, so the API must run elsewhere.

### 1. Deploy the backend first (Railway, Render, Fly.io, etc.)

Host the `server` on a platform that supports a long-running Node process and persistent storage:

- **Railway**: Create a new project, add the `server` folder (or connect the repo and set Root Directory to `server`). Set env vars: `DATABASE_URL`, `PORT`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. Railway can provide a persistent volume for SQLite or you can use their default disk. Run `npm run prisma:migrate` and `npm run prisma:seed` in the deploy (or via CLI). Note the public URL (e.g. `https://your-api.railway.app`).
- **Render**: New Web Service, connect repo, set root to `server`, build command `npm install && npx prisma generate`, start command `npm start`. Add env vars. Use a persistent disk for `DATABASE_URL` if needed, or switch to a hosted DB.
- **Fly.io**: Similar: deploy the server, attach a volume for the SQLite file, set env vars.

After deployment, run migrations (and seed if desired) and copy the API base URL (e.g. `https://your-api.railway.app`).

### 2. Deploy the frontend to Vercel

1. Push the project to GitHub (if not already).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. Set **Root Directory** to `client` (so Vercel builds the React app only).
4. **Build settings** (usually auto-detected for Vite):
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment variables** (required):
   - `VITE_API_URL` = your backend URL (e.g. `https://your-api.railway.app`)  
   No leading slash; the app will call `VITE_API_URL/api/...`.
6. Deploy. Vercel will build the client and serve it; `client/vercel.json` rewrites all routes to `index.html` for React Router.

### 3. CORS

The backend allows all origins (`cors({ origin: "*" })`). If you restrict CORS later, add your Vercel frontend URL (e.g. `https://your-app.vercel.app`) to the allowed origins.

### Summary

| Part     | Where to deploy | Notes                                                                 |
|----------|-----------------|-----------------------------------------------------------------------|
| Frontend | Vercel          | Root = `client`, set `VITE_API_URL` to your API URL.                  |
| Backend  | Railway / Render / Fly.io | Persistent disk or hosted DB; set env vars; run Prisma migrate. |

For a fully serverless backend on Vercel you would need to replace SQLite with a hosted database (e.g. Turso, Neon, PlanetScale) and adapt the API to Vercel serverless functions.

