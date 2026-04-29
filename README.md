# 🌿 ScrapBridge

> A full-stack scrap collection management platform connecting Home Users, Admins, Collectors, and Buyers through a complete pickup lifecycle.

**Tech Stack:** React 18 + Vite · Node.js + Express · Prisma ORM · MySQL 8 · Tailwind CSS · JWT Auth · Nodemailer

---

## 📋 Prerequisites

Make sure you have the following installed before you begin:

- [Node.js 18+](https://nodejs.org/) (includes npm)
- [XAMPP](https://www.apachefriends.org/) (for MySQL via phpMyAdmin) **or** MySQL 8 installed directly
- [Git](https://git-scm.com/) (if cloning)

---

## 📥 Step 1 — Get the Code

You have two options:

### Option A — Clone from GitHub (Recommended)

```bash
git clone https://github.com/ErenYeager-2004/ScrapBridge.git
cd ScrapBridge
```

### Option B — Download ZIP from GitHub

1. Go to [https://github.com/ErenYeager-2004/ScrapBridge](https://github.com/ErenYeager-2004/ScrapBridge)
2. Click the green **Code** button → **Download ZIP**
3. Extract the ZIP to a folder of your choice
4. Open a terminal and `cd` into the extracted folder

---

## 🗄️ Step 2 — Set Up the Database

This project uses a **dedicated MySQL user** called `scrapbridge` (not `root`). You must create this user and database manually before running anything. The Prisma schema handles table creation — it does **not** create the MySQL user.

### Option A — Using phpMyAdmin (XAMPP)

1. **Start XAMPP** — start the **Apache** and **MySQL** services from the XAMPP Control Panel.
2. Open your browser and go to: `http://localhost/phpmyadmin`
3. Click the **SQL** tab at the top and paste the following commands, then click **Go**:

```sql
CREATE DATABASE IF NOT EXISTS scrapbridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'scrapbridge'@'localhost' IDENTIFIED BY 'scrap123';

GRANT ALL PRIVILEGES ON scrapbridge.* TO 'scrapbridge'@'localhost';

FLUSH PRIVILEGES;
```

### Option B — Using MySQL Command Line

Open a terminal and log in as root:

```bash
mysql -u root -p
```

Then run:

```sql
CREATE DATABASE IF NOT EXISTS scrapbridge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'scrapbridge'@'localhost' IDENTIFIED BY 'scrap123';

GRANT ALL PRIVILEGES ON scrapbridge.* TO 'scrapbridge'@'localhost';

FLUSH PRIVILEGES;

EXIT;
```

> **Note:** The password `scrap123` matches what is already set in the backend `.env` file. If you change it here, update `.env` accordingly.

---

## 📧 Step 3 — Set Up Email (Gmail App Password)

ScrapBridge sends real emails for **email verification** and **password reset**. You need a Gmail account dedicated to this project.

> ⚠️ **IMPORTANT: Do NOT use your personal/main Gmail account for this.** Create a brand new Gmail account specifically for ScrapBridge. This keeps your personal account safe and prevents accidental lockouts.

### Steps to create a Gmail App Password:

1. **Create a new Gmail account** at [https://gmail.com](https://gmail.com) — e.g., `scrapbridge.mailer@gmail.com`

2. **Enable 2-Step Verification** on the new account:
   - Go to your Google Account → **Security**
   - Under "How you sign in to Google", click **2-Step Verification**
   - Follow the prompts to enable it

3. **Generate an App Password**:
   - Go to your Google Account → **Security**
   - Under "How you sign in to Google", click **2-Step Verification** again
   - Scroll to the bottom and click **App passwords**
   - In the "Select app" dropdown, choose **Mail**
   - In the "Select device" dropdown, choose **Other (Custom name)** → type `ScrapBridge`
   - Click **Generate**
   - Copy the **16-character password** shown (e.g., `abcd efgh ijkl mnop`)

4. **Add credentials to `.env`** (see Step 4 below)

> The 16-character app password is entered **without spaces** in the `.env` file.

---

## ⚙️ Step 4 — Configure Environment Variables

Open `backend/.env` in any text editor. It should look like this:

```env
DATABASE_URL="mysql://scrapbridge:scrap123@localhost:3306/scrapbridge"
JWT_SECRET="ReddyBhai"
EMAIL_USER="your_email"
EMAIL_PASS="your_email_app_password"
CLIENT_URL="http://localhost:5173"
PORT=5000
```

Update the two email fields with your new Gmail credentials:

```env
EMAIL_USER="scrapbridge.mailer@gmail.com"
EMAIL_PASS="abcdefghijklmnop"
```

> Replace the values above with your actual Gmail address and the 16-character app password (no spaces).
>
> Leave everything else as-is unless you changed the database password in Step 2.

---

## 📦 Step 5 — Install Dependencies

You need to install packages for **both** the backend and frontend separately.

### Install backend dependencies

```bash
cd backend
npm install
```

### Install frontend dependencies

Open a **new terminal** (keep the backend terminal open), then:

```bash
cd frontend
npm install
```

---

## 🏗️ Step 6 — Run Database Migrations

Navigate to the `backend` folder and run:

```bash
cd backend
npx prisma migrate deploy
```

This applies all existing migration files to your freshly created database, creating all the tables (Users, ScrapRequests, Inventory, BuyerOrders, Notifications, Feedback).

> **`migrate deploy` vs `migrate dev`:**
> - Use `migrate deploy` when setting up the project for the first time or in any non-development environment. It applies migrations as-is without prompting.
> - Use `migrate dev` only if you are actively developing and want Prisma to generate new migration files from schema changes.

After migration completes, generate the Prisma client:

```bash
npx prisma generate
```

---

## 🌱 Step 7 — Seed the Database

Still in the `backend` folder, run:

```bash
npm run seed
```

This populates the database with demo data for all four roles:

| Seeded | Count |
|--------|-------|
| Users (Home Users, Collectors, Buyers, Admin) | 11 |
| Scrap Requests (across all statuses) | 22 |
| Inventory Items | 8 |
| Buyer Orders | 11 |
| Feedback Entries | 6 |
| Notifications | 11 |

### Demo login credentials (all roles use the same password):

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@scrapbridge.com` | `password123` |
| Home User | `user1@test.com` | `password123` |
| Collector | `collector1@test.com` | `password123` |
| Buyer | `buyer1@test.com` | `password123` |

> All seeded users have `isVerified: true` so you can log in immediately without email verification.

---

## 🚀 Step 8 — Run the Application

You need **two terminals** running simultaneously.

### Terminal 1 — Start the Backend

```bash
cd backend
npm run dev
```

The backend starts on **http://localhost:5000**. You should see:
```
🚀 Server running on port 5000
✅ Connected to DB
```

### Terminal 2 — Start the Frontend

```bash
cd frontend
npm run dev
```

The frontend starts on **http://localhost:5173**. Open this URL in your browser.

---

## ✅ You're All Set!

Open **http://localhost:5173** in your browser and log in using any of the demo credentials above.

### Role-based access:
- **Admin** → Dashboard, Manage Requests, Inventory, Orders, Users, Analytics, Export
- **Home User** → Submit Requests, Track Pickups, Accept Quotes, Rate Service
- **Collector** → View Assigned Pickups, Mark as Collected
- **Buyer** → Browse Inventory, Place & Track Orders

---

## 🔧 Troubleshooting

**MySQL connection refused?**
→ Make sure XAMPP MySQL service is running, or your MySQL server is started.

**"Access denied for user 'scrapbridge'@'localhost'"?**
→ Re-run the SQL commands from Step 2 to ensure the user exists with the correct password.

**Emails not sending?**
→ Double-check `EMAIL_USER` and `EMAIL_PASS` in `backend/.env`. Make sure 2-Step Verification is enabled and the App Password was generated from the correct Google account.

**Port already in use?**
→ Change `PORT=5000` in `backend/.env` if 5000 is taken, and update `vite.config.js` proxy target accordingly.

**Seed fails with duplicate key errors?**
→ The seed uses `upsert` for users but `create` for requests. If you've run the seed before, reset the database first:
```bash
npx prisma migrate reset
```
This drops all data and re-applies migrations. Then run `npm run seed` again.

---

## 📁 Project Structure

```
ScrapBridge/
├── backend/              # Node.js + Express API
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.js
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── validators/
│   │   └── config/
│   ├── uploads/          # Scrap photo uploads
│   ├── receipts/         # Generated PDF receipts
│   ├── server.js
│   └── .env              # ← configure this
└── frontend/             # React + Vite + Tailwind
    └── src/
        ├── pages/
        ├── components/
        ├── api/
        └── context/
```
