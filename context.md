# ScrapBridge v2.0 — Project Context

## Project Description
ScrapBridge v2.0 is a full-stack web application that digitalises the scrap collection pipeline in India. It connects four user roles — Home User, Admin, Collector, and Buyer — through a role-based platform covering the full pickup lifecycle: Request → Quote → Accept → Schedule → Collect → Complete.

## Tech Stack
- **Frontend:** React 18, Vite 5, Tailwind CSS 3 (dark mode: class), React Router DOM 6, Axios 1, Chart.js 4, react-chartjs-2 5, react-hot-toast 2, lucide-react
- **Backend:** Node.js 18, Express 4, Prisma ORM 5, MySQL 8, ES Modules (ESM)
- **Auth:** JWT (7-day expiry), bcryptjs (salt: 10)
- **Email:** Nodemailer (Gmail SMTP / Mailtrap for dev)
- **File Upload:** Multer (disk storage, local /uploads folder, max 5MB)
- **PDF:** pdfkit (saved to /receipts)
- **CSV:** json2csv
- **Validation:** express-validator
- **Security:** helmet, cors, express-rate-limit

## User Roles
| Role | Description |
|------|-------------|
| HOME_USER | Submits scrap requests, accepts/rejects quotes, downloads receipts, leaves feedback |
| ADMIN | Reviews requests, sets quotes, assigns collectors, manages inventory, views analytics |
| COLLECTOR | Views assigned pickups, marks collections as completed |
| BUYER | Browses inventory, places purchase orders |

## Database Tables
User, ScrapRequest, Inventory, BuyerOrder, Notification, Feedback

## Request Status Flow
PENDING → QUOTED → SCHEDULED → COLLECTED → COMPLETED (or REJECTED at any admin step)

## Project File Structure

### Root
scrapbridge/
├── backend/
├── frontend/
├── context.md         ← this file
├── README.md
└── .gitignore

### Backend
backend/
├── server.js
├── .env
├── receipts/
├── uploads/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── src/
    ├── config/
    │   ├── prisma.js
    │   ├── multer.js
    │   └── nodemailer.js
    ├── routes/
    │   ├── auth.routes.js
    │   ├── request.routes.js
    │   ├── inventory.routes.js
    │   ├── order.routes.js
    │   ├── feedback.routes.js
    │   └── admin.routes.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── request.controller.js
    │   ├── inventory.controller.js
    │   ├── order.controller.js
    │   ├── feedback.controller.js
    │   └── admin.controller.js
    ├── middleware/
    │   ├── auth.middleware.js
    │   ├── role.middleware.js
    │   └── validate.middleware.js
    ├── services/
    │   ├── email.service.js
    │   ├── pdf.service.js
    │   ├── csv.service.js
    │   └── notification.service.js
    └── validators/
        ├── auth.validator.js
        └── request.validator.js

### Frontend
frontend/src/
├── main.jsx
├── App.jsx
├── index.css
├── api/
│   ├── axios.js
│   ├── auth.api.js
│   ├── requests.api.js
│   ├── inventory.api.js
│   ├── orders.api.js
│   ├── feedback.api.js
│   └── admin.api.js
├── context/
│   ├── AuthContext.jsx
│   └── DarkModeContext.jsx
├── hooks/
│   ├── useAuth.js
│   └── useFetch.js
├── routes/
│   ├── ProtectedRoute.jsx
│   └── RoleRoute.jsx
├── components/
│   ├── common/
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── NotificationBell.jsx
│   │   ├── ConfirmModal.jsx
│   │   ├── StarRating.jsx
│   │   ├── DataTable.jsx
│   │   └── DarkModeToggle.jsx
│   ├── charts/
│   │   ├── BarChart.jsx
│   │   ├── DoughnutChart.jsx
│   │   └── LineChart.jsx
│   ├── forms/
│   │   └── ImageUpload.jsx
│   └── layout/
│       └── DashboardLayout.jsx
├── pages/
│   ├── public/
│   │   ├── Landing.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── VerifyEmail.jsx
│   │   ├── ForgotPassword.jsx
│   │   └── ResetPassword.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── AllRequests.jsx
│   │   ├── RequestDetail.jsx
│   │   ├── InventoryManager.jsx
│   │   ├── AllOrders.jsx
│   │   ├── FeedbackView.jsx
│   │   └── ExportTools.jsx
│   ├── homeuser/
│   │   ├── UserDashboard.jsx
│   │   ├── NewRequest.jsx
│   │   ├── RequestHistory.jsx
│   │   └── RequestDetail.jsx
│   ├── collector/
│   │   ├── CollectorDashboard.jsx
│   │   ├── AssignedPickups.jsx
│   │   └── PickupDetail.jsx
│   └── buyer/
│       ├── BuyerDashboard.jsx
│       ├── BrowseInventory.jsx
│       └── OrderHistory.jsx
└── utils/
    └── formatters.js

## Current Phase
Phase 2 — Core Pickup Request Flow

### Phase 1 — Authentication System — ✅ Complete
- Task 1.1 Backend Middleware & Config — ✅ Complete
- Task 1.2 Prisma Schema & Migration — ✅ Complete
- Task 1.3 Auth Controller & Routes — ✅ Complete
- Task 1.4 Frontend API Layer & Auth Context — ✅ Complete
- Task 1.5 Public Pages, Routing & Dashboard Shells — ✅ Complete

## Phases Overview
| Phase | Name | Status |
|-------|------|--------|
| 0 | Environment Setup | ✅ Done (manual) |
| 1 | Authentication System | ✅ Complete |
| 2 | Core Pickup Request Flow | ✅ Task 2.1 Complete |
| 3 | Email Verification & Password Reset | ⬜ Not started |
| 4 | Buyer Module | ⬜ Not started |
| 5 | PDF Receipt Generation | ⬜ Not started |
| 6 | Rating & Feedback System | ⬜ Not started |
| 7 | Admin Dashboard Enhancements | ⬜ Not started |
| 8 | CSV Export | ⬜ Not started |
| 9 | Dark Mode & Final Polish | ⬜ Not started |

## Files Created So Far
(Update this list after each task)
- context.md
- backend/server.js
- backend/src/config/prisma.js
- backend/src/config/multer.js
- backend/src/middleware/auth.middleware.js
- backend/src/middleware/role.middleware.js
- backend/src/middleware/validate.middleware.js
- backend/src/validators/auth.validator.js
- backend/prisma/schema.prisma
- backend/prisma/migrations/20260419064018_init/migration.sql
- backend/uploads/.gitkeep
- backend/receipts/.gitkeep
- backend/src/controllers/auth.controller.js
- backend/src/routes/auth.routes.js
- frontend/tailwind.config.js (updated: darkMode class, content paths)
- frontend/src/index.css (replaced: Tailwind directives + --brand CSS variable)
- frontend/vite.config.js (updated: /api proxy → localhost:5000)
- frontend/src/api/axios.js
- frontend/src/api/auth.api.js
- frontend/src/context/AuthContext.jsx
- frontend/src/hooks/useAuth.js
- frontend/src/hooks/useFetch.js
- frontend/src/context/DarkModeContext.jsx
- frontend/src/routes/ProtectedRoute.jsx
- frontend/src/routes/RoleRoute.jsx
- frontend/src/pages/public/Landing.jsx
- frontend/src/pages/public/Login.jsx
- frontend/src/pages/public/Register.jsx
- frontend/src/pages/public/VerifyEmail.jsx
- frontend/src/pages/public/Unauthorized.jsx
- frontend/src/pages/admin/AdminDashboard.jsx
- frontend/src/pages/homeuser/UserDashboard.jsx
- frontend/src/pages/collector/CollectorDashboard.jsx
- frontend/src/pages/buyer/BuyerDashboard.jsx
- frontend/src/components/common/Sidebar.jsx
- frontend/src/components/common/Navbar.jsx
- frontend/src/components/layout/DashboardLayout.jsx
- frontend/src/App.jsx (replaced)
- frontend/src/main.jsx (verified)
- backend/src/services/notification.service.js
- backend/src/controllers/request.controller.js
- backend/src/routes/request.routes.js
- backend/src/routes/notification.routes.js

## Task Completion Log
(Append a short entry after each task)
- [Setup] Project scaffolding done manually. Backend and frontend folders created. MySQL DB created.
- [Task 1.1] Backend foundation files created: server.js, prisma.js (singleton), multer.js (disk storage, 5MB, image filter), auth.middleware.js (JWT verifyToken), role.middleware.js (requireRole factory), validate.middleware.js (express-validator glue), auth.validator.js (register/login/forgotPassword/resetPassword chains). Server starts cleanly; GET /api/health returns {status:'ok'}.
- [Task 1.2] Prisma schema defined with 4 enums (Role, RequestStatus, MaterialType, OrderStatus) and 6 models (User, ScrapRequest, Inventory, BuyerOrder, Notification, Feedback). Note: Prisma v7 requires datasource URL in prisma.config.ts — url field removed from schema.prisma. Migration `20260419064018_init` applied successfully. Prisma Client v7.7.0 generated.
- [Misc] Comprehensive `.gitignore` and `.gitkeep` files added to root, backend, and frontend to secure environment variables and maintain directory structure without committing temporary files.
- [Task 1.3] Auth controller and routes fully implemented and verified. Features include bcrypt password hashing, JWT authentication (7d expiry), and rate limiting (15 req/15 min). Verified via curl: Register (201), Login (200), and Profile (200). Note: Downgraded to Prisma v5 to resolve v7 driver adapter connectivity issues.
- [Task 1.4] Frontend API layer and auth context set up. tailwind.config.js updated (darkMode: class, content paths). index.css replaced with Tailwind directives + --brand: #1A7A4A. vite.config.js updated with /api proxy to localhost:5000. Created: src/api/axios.js (Axios instance with JWT interceptors), src/api/auth.api.js (login, register, getMe, forgotPassword, resetPassword), src/context/AuthContext.jsx (user/token/loading state, session restore on mount), src/hooks/useAuth.js (context consumer hook), src/hooks/useFetch.js (generic data-fetching hook with refetch).
- [Task 1.5] Public pages, routing, and dashboard shells built. Created: DarkModeContext (stub), ProtectedRoute (loading spinner → token check → isVerified check), RoleRoute (allowedRoles prop), Landing (hero + 3-step section), Login (dark glassmorphism card, role-redirects), Register (all fields, HOME_USER + BUYER roles only), VerifyEmail (placeholder), Unauthorized (403 page), AdminDashboard/UserDashboard/CollectorDashboard/BuyerDashboard (stubs), Sidebar (stub with user info), Navbar (functional logout), DashboardLayout (fixed sidebar + navbar + Outlet), App.jsx (full BrowserRouter with nested ProtectedRoute + RoleRoute + DashboardLayout), main.jsx (StrictMode). Phase 1 complete.
- [Task 2.1] Notification service and full Request controller implemented. All 11 lifecycle endpoints (Create, My, All, GetByID, Quote, Reject, Respond, Schedule, Collect, Complete) and Notification helpers (GetMy, MarkRead) are wired and role-protected. Inventory is auto-populated upon request completion. Server updated to include /api/requests and /api/notifications routes.

## Deviations from Original Plan

### Prisma Downgrade (v7 -> v5)
We initially attempted to use Prisma v7 which requires a runtime driver adapter (`@prisma/adapter-mariadb`). Due to persistent connectivity issues where the adapter ignored pool credentials (leading to "Access Denied" errors), we downgraded to **Prisma v5.22.0**.
- **Result:** Native MySQL/MariaDB connection works perfectly.
- **Schema:** Restored `url = env("DATABASE_URL")` to `prisma/schema.prisma`.
- **Config:** Removed `prisma.config.ts`. `src/config/prisma.js` reverted to a simple `new PrismaClient()` singleton.

### Database Security
- Created a dedicated MySQL user `scrapbridge` with password `scrap123` to avoid root authentication plugin issues in XAMPP.
- Repaired corrupt `mysql.db` system table in XAMPP.

## Notes for Next Session
- Phase 1 is fully complete. All Tasks 1.1–1.5 done.
- **Next Phase:** Phase 2 — Core Pickup Request Flow (ScrapRequest CRUD: Home User submits, Admin reviews/quotes, Collector marks collected).
- Current Test User: `test@example.com` / `password123` (HOME_USER role).
- To create an ADMIN test user, register via API with role: ADMIN or update DB directly.
