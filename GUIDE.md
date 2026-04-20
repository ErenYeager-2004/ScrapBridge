# ScrapBridge v2.0 — New Machine Setup Guide

This guide explains how to set up and run the ScrapBridge project on a new machine after pulling it from GitHub.
It assumes you have **XAMPP** installed (which comes with MySQL pre-installed).

---

## Prerequisites

Make sure the following are installed on the new machine:

- [Node.js 18+](https://nodejs.org/)
- [XAMPP](https://www.apachefriends.org/) (for MySQL)
- [Git](https://git-scm.com/)

---

## Step 1 — Pull the Project from GitHub

Open a terminal and run:

```bash
git clone https://github.com/YOUR_USERNAME/ScrapBridge.git
cd ScrapBridge
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 2 — Start XAMPP MySQL

1. Open the **XAMPP Control Panel**
2. Click **Start** next to **MySQL**
3. Make sure the status turns green (running on port **3306**)

---

## Step 3 — Create the Database & User in phpMyAdmin

Open your browser and go to: **`http://localhost/phpmyadmin`**

> **Note:** By default, XAMPP MySQL has **no password** for the root user.
> Log in with username `root` and leave the password field empty.
> If that fails, try opening XAMPP → MySQL → **Shell** and run `mysql -u root` directly.

### 3a — Create the Database

Click the **SQL** tab at the top of phpMyAdmin and run:

```sql
CREATE DATABASE scrapbridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3b — Create the Dedicated User

Still in the **SQL** tab, run the following three commands:

```sql
CREATE USER 'scrapbridge'@'localhost' IDENTIFIED BY 'scrap123';
GRANT ALL PRIVILEGES ON scrapbridge.* TO 'scrapbridge'@'localhost';
FLUSH PRIVILEGES;
```

> This creates a dedicated MySQL user (`scrapbridge`) with password (`scrap123`).
> This matches the credentials already set in the `.env` file (see Step 4), so no changes are needed there.

---

## Step 4 — Create the `.env` File

The `.env` file is **gitignored** and will NOT be present after cloning.
You must create it manually.

**Create the file at:** `backend/.env`

Paste the following content into it exactly:

```env
DATABASE_URL="mysql://scrapbridge:scrap123@localhost:3306/scrapbridge"
JWT_SECRET="ReddyBhai"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password_here"
CLIENT_URL="http://localhost:3000"
PORT=5000
```

> - `DATABASE_URL` — points to the MySQL database you just created
> - `JWT_SECRET` — secret key for signing JWT tokens (keep this consistent across machines)
> - `EMAIL_USER` / `EMAIL_PASS` — Gmail credentials for sending emails (optional for local dev)
> - `CLIENT_URL` — the frontend URL (used in email links)
> - `PORT` — the port the backend server runs on

---

## Step 5 — Install Dependencies

You need to install `node_modules` for both the backend and frontend separately.

**Backend:**
```bash
cd backend
npm install
```

**Frontend** (open a new terminal or navigate back):
```bash
cd frontend
npm install
```

---

## Step 6 — Run Prisma Migration

This step creates all the database tables using the migration files already in the repo.

```bash
cd backend
npx prisma migrate deploy
```

> **Why `deploy` and not `dev`?**
> - `migrate dev` is for when **you edited `schema.prisma`** — it creates a new migration file AND runs it.
> - `migrate deploy` is for when **someone else already created** the migration files — it just runs them.
> - If you run `migrate dev` on a fresh machine, Prisma sees the DB is empty but migration files already exist,
>   gets confused about the state, and may prompt you to **wipe the database** or create duplicate migration files.
>
> **The rule for your 2-machine workflow:**
> - Machine that **edited `schema.prisma`** → `migrate dev`
> - Machine that **pulled the changes** → `migrate deploy`

Then generate the Prisma Client:

```bash
npx prisma generate
```

> This generates the type-safe database client that the backend uses to talk to MySQL.

---

## Step 7 — Seed the Test Users

Run the seed script to create default test accounts for all 4 roles:

```bash
cd backend
node seed-admin.js
```

This creates the following accounts (all with password `password123`):

| Role | Email |
|------|-------|
| Admin | admin@example.com |
| Home User | user@example.com |
| Collector | collector@example.com |
| Buyer | buyer@example.com |

> The script uses `upsert` — so it's safe to run multiple times. It won't create duplicates.

---

## Step 8 — Run the Project

You need **two terminals** — one for the backend, one for the frontend.

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

The backend will start at: `http://localhost:5000`
Test it by visiting: `http://localhost:5000/api/health` — you should see `{ "status": "ok" }`

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will start at: `http://localhost:3000`
Open it in your browser.

---

## ✅ Quick Checklist

| # | Step | Status |
|---|------|--------|
| 1 | `git clone` the project | ⬜ |
| 2 | Start XAMPP MySQL | ⬜ |
| 3 | Create `scrapbridge` database in phpMyAdmin | ⬜ |
| 4 | Create `scrapbridge` MySQL user with password `scrap123` | ⬜ |
| 5 | Create `backend/.env` with the values from Step 4 | ⬜ |
| 6 | `npm install` in `backend/` | ⬜ |
| 7 | `npm install` in `frontend/` | ⬜ |
| 8 | `npx prisma migrate deploy` | ⬜ |
| 9 | `npx prisma generate` | ⬜ |
| 10 | `node seed-admin.js` | ⬜ |
| 11 | `npm run dev` in both `backend/` and `frontend/` | ⬜ |

---

## 🔧 Troubleshooting

### MySQL root has a password / can't log into phpMyAdmin

XAMPP by default sets no password for root. If yours does have a password:
1. Open XAMPP Control Panel → MySQL → click **Shell**
2. Run: `mysql -u root` (no password flag)
3. If that fails: `mysql -u root -p` and try entering the password you may have set before

### `npx prisma migrate deploy` fails

- Make sure XAMPP MySQL is running
- Make sure the `scrapbridge` database exists in phpMyAdmin
- Make sure the `backend/.env` file exists with the correct `DATABASE_URL`
- Double check the user and password match what you created in Step 3b

### `npm install` fails

- Make sure Node.js 18+ is installed: `node -v`
- Try deleting `node_modules` and `package-lock.json` and running `npm install` again

### Backend starts but frontend can't reach the API

- Make sure the backend is running on port `5000`
- The frontend Vite config proxies `/api` requests to `localhost:5000` automatically
- Check that both dev servers are running at the same time

### Email features not working

- Fill in real Gmail credentials in `backend/.env` (`EMAIL_USER` and `EMAIL_PASS`)
- Use a **Gmail App Password** (not your regular Gmail password)
- Go to Google Account → Security → 2-Step Verification → App Passwords to generate one

---

## 📁 Important Directories Created at Runtime

These folders are **gitignored** and will be created automatically when the server runs:

| Folder | Purpose |
|--------|---------|
| `backend/uploads/` | Stores uploaded scrap images from users |
| `backend/receipts/` | Stores generated PDF receipts |
| `backend/node_modules/` | Backend npm packages |
| `frontend/node_modules/` | Frontend npm packages |
| `frontend/dist/` | Production build output (only if you run `npm run build`) |

---

*Last updated: April 2026 — ScrapBridge v2.0*
