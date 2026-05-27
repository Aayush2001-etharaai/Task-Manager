# Team Task Manager 

A full-stack web app for managing team projects and tasks. Users sign up, create projects, invite members, assign work, and track progress from a shared dashboard.

Built with React, Node.js, Express, and MySQL. Deployed on Railway.

---

## Live links (fill in after deploy)

| | URL |
|--|-----|
| Application | https://thriving-inspiration-production-0790.up.railway.app/login|
| GitHub | https://github.com/Aayush2001-etharaai/Task-Manager.git|

---

## What the app does

- **Sign up / log in** with name, email, and password (JWT stored in an HTTP-only cookie)
- **Projects** — any user can create a project and becomes that project’s admin
- **Members** — project admins add or remove members by email
- **Tasks** — title, description, due date, priority, assignment to one or more members
- **Status** — To Do, In Progress, Done
- **Dashboard** — total tasks, breakdown by status, overdue count, tasks per member, charts
- **Roles**
  - **Admin** (optional at signup with join code) — full access across the app
  - **Member** — sees their projects and can update tasks assigned to them

---

## Tech stack

| Layer | Tools |
|-------|--------|
| Frontend | React 19, Vite, Tailwind CSS, Redux Toolkit, Recharts |
| Backend | Node.js, Express 5 |
| Database | MySQL |
| Auth | JWT + cookies |
| Hosting | Railway |

---

## Database design

```
users
projects          (creator → project admin)
project_members   (user ↔ project, role: admin | member)
tasks             (belongs to a project)
task_assignees    (user ↔ task)
```

---

## Run locally

### Install

```bash
cd backend && npm install
cd ../frontend && npm install
```

### MySQL (required)

The backend needs MySQL on port **3306**. Easiest option with Docker:

1. Open **Docker Desktop** and wait until it says it is running.
2. From the project root:

```bash
docker compose up -d
```

3. Your `backend/.env` should use `MYSQL_PASSWORD=rootpass` (matches `docker-compose.yml`).

The app creates tables automatically on first backend start.

If you see `ECONNREFUSED 127.0.0.1:3306`, MySQL is not running — start Docker and run the command above.

### Environment files

**backend/.env**

```env
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=rootpass
MYSQL_DATABASE=taskmanager
JWT_SECRET=change_this_secret
ADMIN_JOIN_CODE=admin123
FRONT_END_URL=http://localhost:5173
NODE_ENV=development
PORT=3000
```

**frontend/.env**

```env
VITE_API_URL=http://localhost:3000/api
```

### Start

```bash
# terminal 1
cd backend
npm run dev

# terminal 2
cd frontend
npm run dev
```

Open http://localhost:5173

- Normal signup → **member**
- Signup with admin join code (`admin123` by default) → **admin**

---

## Deploy on Railway

Use Railway for the database, API, and frontend (no Vercel).

### 1. GitHub

Push this project to your own GitHub repository.

### 2. MySQL service

In Railway: **New → Database → MySQL**. Copy host, user, password, and database name into the backend service variables.

### 3. Backend service

- Connect the repo, set **Root Directory** to `backend`
- Variables: all `MYSQL_*` fields, `JWT_SECRET`, `ADMIN_JOIN_CODE`, `NODE_ENV=production`, and `FRONT_END_URL` (your frontend Railway URL after step 4)
- Railway sets `PORT` automatically

### 4. Frontend service

- Same repo, **Root Directory** `frontend`
- Build: `npm install && npm run build`
- Start: `npx serve dist -s -l $PORT`
- Variable: `VITE_API_URL=https://your-backend.up.railway.app/api` (set before build)

### 5. CORS

After the frontend URL is live, set `FRONT_END_URL` on the backend to that URL and redeploy.

---

## API overview

| Method | Endpoint | Who |
|--------|----------|-----|
| POST | `/api/auth/sign-up` | Public |
| POST | `/api/auth/sign-in` | Public |
| GET/POST | `/api/projects` | Logged in |
| POST/DELETE | `/api/projects/:id/members` | Project admin |
| GET/POST/PUT/DELETE | `/api/tasks` | Logged in (rules by role) |
| GET | `/api/tasks/dashboard-data` | Logged in |
| GET | `/api/users/get-users` | Admin |
| DELETE | `/api/users/:id` | Admin |

---

## Submission

1. Deploy on Railway and test signup, projects, tasks, and dashboard.
2. Put the **live URL** and **GitHub link** in the table at the top of this file.
3. Submit both links as required by your assignment.

---

## Project structure

```
backend/     Express API, MySQL models
frontend/    React UI
README.md    Setup and deployment notes
```
