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
Phase 1 — Authentication System (in progress)
- Task 1.1 Backend Middleware & Config — ✅ Complete
- Task 1.2 Prisma Schema & Migration — ✅ Complete

## Phases Overview
| Phase | Name | Status |
|-------|------|--------|
| 0 | Environment Setup | ✅ Done (manual) |
| 1 | Authentication System | 🔄 In Progress (Tasks 1.1 ✅, 1.2 ✅) |
| 2 | Core Pickup Request Flow | ⬜ Not started |
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

## Task Completion Log
(Append a short entry after each task)
- [Setup] Project scaffolding done manually. Backend and frontend folders created. MySQL DB created.
- [Task 1.1] Backend foundation files created: server.js, prisma.js (singleton), multer.js (disk storage, 5MB, image filter), auth.middleware.js (JWT verifyToken), role.middleware.js (requireRole factory), validate.middleware.js (express-validator glue), auth.validator.js (register/login/forgotPassword/resetPassword chains). Server starts cleanly; GET /api/health returns {status:'ok'}.
- [Task 1.2] Prisma schema defined with 4 enums (Role, RequestStatus, MaterialType, OrderStatus) and 6 models (User, ScrapRequest, Inventory, BuyerOrder, Notification, Feedback). Note: Prisma v7 requires datasource URL in prisma.config.ts — url field removed from schema.prisma. Migration `20260419064018_init` applied successfully. Prisma Client v7.7.0 generated.
- [Misc] Comprehensive `.gitignore` and `.gitkeep` files added to root, backend, and frontend to secure environment variables and maintain directory structure without committing temporary files.

## Deviations from Original Plan
(Note any changes made here)
- None so far

## Notes for Next Session
- Tasks 1.1 and 1.2 are complete. Next: Task 1.3 — Auth Controller & Routes (register, login, email verify, forgot/reset password).
