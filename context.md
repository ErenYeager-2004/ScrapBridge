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
Phase 5 — PDF Receipt Generation

### Phase 4 — Buyer Module — ✅ Complete
- Task 4.1 Inventory & Order Controllers + Routes — ✅ Complete
- Task 4.2 Buyer & Admin Frontend Pages — ✅ Complete

### Phase 3 — Email Verification & Password Reset — ✅ Complete
- Task 3.1 Nodemailer Config, Email Service & Auth Controller — ✅ Complete
- Task 3.2 VerifyEmail, ForgotPassword & ResetPassword Frontend Pages — ✅ Complete

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
| 2 | Core Pickup Request Flow | ✅ Complete |
| 3 | Email Verification & Password Reset | ✅ Complete |
| 4 | Buyer Module | ✅ Complete |
| 5 | PDF Receipt Generation | 🔄 In Progress |
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
- backend/src/validators/request.validator.js
- backend/src/routes/request.routes.js (updated: validator chains + receipt 501 placeholder)
- backend/src/routes/notification.routes.js
- backend/server.js (updated: prisma/verifyToken/requireRole imports + GET /api/collectors inline route)
- frontend/src/utils/formatters.js
- frontend/src/components/common/StatusBadge.jsx
- frontend/src/components/common/ConfirmModal.jsx
- frontend/src/components/common/StarRating.jsx
- frontend/src/components/common/DataTable.jsx
- frontend/src/components/common/NotificationBell.jsx
- frontend/src/components/common/DarkModeToggle.jsx
- frontend/src/components/forms/ImageUpload.jsx
- frontend/src/components/common/Sidebar.jsx (replaced stub with full role-aware nav)
- frontend/src/api/requests.api.js
- frontend/src/components/common/Navbar.jsx (updated: added NotificationBell + DarkModeToggle imports)
- frontend/src/pages/homeuser/NewRequest.jsx
- frontend/src/pages/homeuser/RequestHistory.jsx
- frontend/src/pages/homeuser/RequestDetail.jsx
- frontend/src/pages/homeuser/UserDashboard.jsx (replaced stub with full dashboard)
- frontend/src/App.jsx (updated: added /user/new-request, /user/requests, /user/requests/:id routes)
- backend/src/controllers/request.controller.js (updated: added getAssignedPickups controller)
- backend/src/routes/request.routes.js (updated: added GET /api/requests/assigned for COLLECTOR)
- frontend/src/api/requests.api.js (updated: added getAssignedPickups API function)
- frontend/src/pages/admin/AllRequests.jsx
- frontend/src/pages/admin/RequestDetail.jsx (Admin view)
- frontend/src/pages/admin/AdminDashboard.jsx (replaced stub: 4 stat cards + recent requests table)
- frontend/src/pages/collector/AssignedPickups.jsx
- frontend/src/pages/collector/PickupDetail.jsx
- frontend/src/pages/collector/CollectorDashboard.jsx (replaced stub: 3 stat cards + today/upcoming sections)
- frontend/src/App.jsx (updated: added admin requests, admin request detail, collector pickups, collector pickup detail routes)
- backend/src/config/nodemailer.js (new: Nodemailer transporter using Gmail/Mailtrap; reads EMAIL_USER + EMAIL_PASS from .env)
- backend/src/services/email.service.js (new: sendVerificationEmail, sendPasswordResetEmail, sendPickupNotificationEmail)
- backend/src/controllers/auth.controller.js (updated: register now sets isVerified=false + sends verification email; verifyEmail, forgotPassword, resetPassword fully implemented)
- backend/src/routes/auth.routes.js (updated: replaced 501 stubs with real verifyEmail/forgotPassword/resetPassword controller bindings)
- backend/src/controllers/inventory.controller.js (new: getInventory with ?materialType/minWeight/maxPrice filters + getAllInventory admin view)
- backend/src/controllers/order.controller.js (new: placeOrder with $transaction, getMyOrders, getAllOrders, confirmOrder, deliverOrder)
- backend/src/routes/inventory.routes.js (new: GET / ADMIN|BUYER, GET /all ADMIN)
- backend/src/routes/order.routes.js (new: POST /, GET /my BUYER, GET / ADMIN, PATCH /:id/confirm ADMIN, PATCH /:id/deliver ADMIN)
- backend/server.js (updated: added inventoryRoutes + orderRoutes imports and mounts)
- frontend/src/api/inventory.api.js (new: getInventory with filters, getAllInventory)
- frontend/src/api/orders.api.js (new: placeOrder, getMyOrders, getAllOrders, confirmOrder, deliverOrder)
- frontend/src/pages/buyer/BrowseInventory.jsx (new: filter bar, 3-col card grid, inline order modal with qty input + price preview)
- frontend/src/pages/buyer/OrderHistory.jsx (new: buyer's orders table with StatusBadge)
- frontend/src/pages/buyer/BuyerDashboard.jsx (replaced stub: 3 stat cards + inventory highlights + recent orders table)
- frontend/src/pages/admin/AllOrders.jsx (new: all orders table with per-row Confirm / Mark Delivered action buttons)
- frontend/src/pages/admin/InventoryManager.jsx (new: full inventory table with material + availability filters)
- frontend/src/App.jsx (updated: added /buyer/inventory, /buyer/orders, /admin/orders, /admin/inventory routes)
- [BugFix] backend/prisma/schema.prisma (updated: weightKg → totalKg, added reservedKg @default(0), added CANCELLED to OrderStatus enum)
- [BugFix] backend/src/controllers/inventory.controller.js (rewritten: computes availableKg = totalKg - reservedKg; buyers receive only availableKg; admins see all three)
- [BugFix] backend/src/controllers/order.controller.js (rewritten: atomic reservation model — placeOrder guards stock with transaction; confirmOrder decrements totalKg+reservedKg; cancelOrder releases reservedKg; deliverOrder inventory-neutral)
- [BugFix] backend/src/controllers/request.controller.js (updated: inventory create uses totalKg instead of weightKg)
- [BugFix] backend/src/routes/order.routes.js (updated: added PATCH /:id/cancel ADMIN route)
- [BugFix] frontend/src/api/orders.api.js (updated: added cancelOrder function)
- [BugFix] frontend/src/pages/buyer/BrowseInventory.jsx (rewritten: uses availableKg; client-side qty guard; updated materialType list to match DB enum)
- [BugFix] frontend/src/pages/buyer/BuyerDashboard.jsx (updated: highlights use availableKg, not weightKg)
- [BugFix] frontend/src/pages/admin/InventoryManager.jsx (rewritten: 3-column weight view Total/Reserved/Available; colour-coded cells; badge uses availableKg > 0)
- [BugFix] frontend/src/pages/admin/AllOrders.jsx (updated: Cancel button for PLACED orders with ConfirmModal; imports cancelOrder)
- [BugFix] frontend/src/components/common/StatusBadge.jsx (updated: added CANCELLED style)

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
- [Task 2.2] Request validator (request.validator.js) created with 5 chains: createRequestValidator, quoteRequestValidator, respondValidator, scheduleValidator, rejectValidator. request.routes.js rewired with validator chains + validate middleware on all mutation endpoints; /:id/receipt 501 placeholder added. notification.routes.js confirmed complete. server.js updated: prisma/verifyToken/requireRole imports added + GET /api/collectors inline route (ADMIN-only, returns all COLLECTOR users). Bug fix: contactPhone defaulted to "" in createRequest controller (schema field is required/non-nullable). Live test passed: full PENDING→QUOTED→SCHEDULED→COLLECTED lifecycle verified via curl with all 4 seed users. Notifications firing correctly.
- [Task 2.3] All shared/common frontend components built. Created: formatters.js (formatDate, formatCurrency, formatWeight, capitalize, getRelativeTime), StatusBadge (9 status colours), ConfirmModal (optional textarea, backdrop dismiss), StarRating (interactive + readOnly via lucide-react Star), DataTable (filterable, empty state, onRowClick), NotificationBell (fetch /my on mount, unread badge, dropdown, mark-all-read), DarkModeToggle (Moon/Sun from DarkModeContext), ImageUpload (drag-drop, max 5 files, JPEG/PNG/WEBP, thumbnail previews with remove). Sidebar stub replaced with full role-aware NavLink nav (ADMIN 6 links, HOME_USER 3, COLLECTOR 3, BUYER 3) using lucide-react icons + #1A7A4A active state. requests.api.js created with all 11 lifecycle functions. Bug fix: Navbar.jsx updated to import and render NotificationBell + DarkModeToggle (these components were built in 2.3 but Navbar stub from Phase 1 had no reference to them).
- [Task 2.4] Home User request pages implemented. Created: NewRequest.jsx (3-step form: materials with add/remove, location & contact, photo upload; builds FormData and calls createRequest; navigates to /user/requests on success), RequestHistory.jsx (table with status filter, summarised items, StatusBadge, empty state), RequestDetail.jsx (materials table, pickup details, photos, admin notes, quote accept/reject with ConfirmModal, schedule info, completion banner with disabled receipt button), UserDashboard.jsx (replaced stub: 3 stat cards, QUOTED alert with respond button, large new-request CTA, recent-5 requests table). App.jsx updated to wire /user/new-request, /user/requests, /user/requests/:id routes.
- [Task 2.5] Admin + Collector views implemented. Backend: getAssignedPickups controller added (GET /api/requests/assigned, COLLECTOR role, filters by collectorId); route wired in request.routes.js; getAssignedPickups added to requests.api.js. Frontend: admin/AllRequests.jsx (full-width filterable table with status/date/search filters, View button → /admin/requests/:id), admin/RequestDetail.jsx (60/40 two-column layout; action panel varies by status — quote form for PENDING, awaiting label for QUOTED, schedule info for SCHEDULED, Mark Complete for COLLECTED, completion banner for COMPLETED/REJECTED), admin/AdminDashboard.jsx (replaced stub: 4 stat cards + recent requests table), collector/AssignedPickups.jsx (status filter, table with View button), collector/PickupDetail.jsx (contact/address/materials/photos + Mark as Collected with ConfirmModal), collector/CollectorDashboard.jsx (3 stat cards, Today's Pickups cards, Upcoming Pickups list). App.jsx updated to add all 4 new routes. Phase 2 complete.
- [Task 3.1] Nodemailer config + email service + auth controller Phase 3 flows implemented. Created: backend/src/config/nodemailer.js (Gmail/Mailtrap transporter), backend/src/services/email.service.js (sendVerificationEmail — styled HTML + verify link; sendPasswordResetEmail — amber-themed, 1-hour expiry warning; sendPickupNotificationEmail — green notification email). Updated: auth.controller.js (register now sets isVerified=false, generates UUID verificationToken, saves it, sends verification email non-blocking; verifyEmail reads ?token from query, finds user, sets isVerified=true + clears token, redirects to CLIENT_URL/verify-email?success=true; forgotPassword always returns 200, generates UUID resetToken + expiry 1h, emails link; resetPassword validates token + expiry > now, hashes new password, clears reset fields). auth.routes.js: 501 stubs replaced with real controller wiring.
- [Task 3.2] VerifyEmail, ForgotPassword, and ResetPassword frontend pages built. Updated: frontend/src/pages/public/VerifyEmail.jsx (full implementation: reads token/?success=true from URL, calls GET /api/auth/verify-email?token=TOKEN, shows loading/success/error/idle states). Created: frontend/src/pages/public/ForgotPassword.jsx (centred card, single email input, always shows safe 'link sent' message), frontend/src/pages/public/ResetPassword.jsx (reads token from URL, client-side password match validation, calls POST /api/auth/reset-password, auto-navigates to /login after 2s on success). Updated: frontend/src/api/auth.api.js (added verifyEmail function), frontend/src/App.jsx (added /forgot-password and /reset-password routes), frontend/src/pages/public/Login.jsx (added 'Forgot Password?' link + 403 verify-email yellow alert). Phase 3 complete.
- [Task Misc] Adjusted ESLint rules: changed `no-unused-vars` from `error` to `warn` in `frontend/eslint.config.js` to show yellow squiggles instead of red for unused variables.
- [Misc] Added `mail.md` to `.gitignore` to prevent tracking of internal email templates/notes.
- [Task 4.1] Inventory and Order backend APIs implemented. Created: inventory.controller.js (getInventory with materialType/minWeight/maxPrice query filters + include source request info; getAllInventory for admin with orders count), order.controller.js (placeOrder uses prisma.$transaction to atomically create order + flip inventory.available=false + notify all admins; getMyOrders for buyer; getAllOrders for admin; confirmOrder + deliverOrder each update status and send buyer notification). Created: inventory.routes.js, order.routes.js (all routes role-protected with verifyToken + requireRole). server.js updated to mount /api/inventory and /api/orders.
- [Task 4.2] Buyer and Admin frontend pages implemented. Created: inventory.api.js (getInventory + getAllInventory), orders.api.js (placeOrder, getMyOrders, getAllOrders, confirmOrder, deliverOrder). BrowseInventory.jsx: filter bar (material type dropdown + min weight + max price), 3-col colour-coded card grid, inline order modal with quantity input, live total price preview, validation, and post-order refetch. OrderHistory.jsx: buyer's orders table with StatusBadge, formatWeight/formatCurrency. BuyerDashboard.jsx (replaced stub): 3 stat cards (Total Orders, Active Orders, Total Spent from DELIVERED), inventory highlights top-3 mini-cards with Browse All link, recent 5 orders table. AllOrders.jsx (admin): all orders table with per-row Confirm (PLACED) and Mark Delivered (CONFIRMED) action buttons with spinner feedback and toast messages. InventoryManager.jsx (admin): full inventory table with material type + availability toggle filters, Yes/No availability badge, total value column. App.jsx updated to add /buyer/inventory, /buyer/orders, /admin/orders, /admin/inventory routes. Phase 4 complete.
- [Bug Fix] Inventory reservation model implemented. Root cause: placeOrder was blindly flipping available=false on the whole inventory item, causing overselling and phantom stock disappearance. Fix: renamed Inventory.weightKg → totalKg, added Inventory.reservedKg @default(0), added CANCELLED to OrderStatus enum. New behaviour — placeOrder atomically increments reservedKg by quantityKg and checks availableKg (= totalKg − reservedKg) > 0 before proceeding. confirmOrder decrements both totalKg and reservedKg (sale finalised). cancelOrder decrements only reservedKg (stock released). deliverOrder is inventory-neutral. Inventory is hidden from buyers only when availableKg reaches 0. Admin sees all three columns (Total / Reserved / Available) in InventoryManager with colour-coded cells. Buyers only see availableKg. Requires migration: npx prisma migrate dev --name inventory_reservation_model.


## Deviations from Original Plan

### Prisma Downgrade (v7 -> v5)
We initially attempted to use Prisma v7 which requires a runtime driver adapter (`@prisma/adapter-mariadb`). Due to persistent connectivity issues where the adapter ignored pool credentials (leading to "Access Denied" errors), we downgraded to **Prisma v5.22.0**.
- **Result:** Native MySQL/MariaDB connection works perfectly.
- **Schema:** Restored `url = env("DATABASE_URL")` to `prisma/schema.prisma`.
- **Config:** Removed `prisma.config.ts`. `src/config/prisma.js` reverted to a simple `new PrismaClient()` singleton.

### Database Security
- Created a dedicated MySQL user `scrapbridge` with password `scrap123` to avoid root authentication plugin issues in XAMPP.
- Repaired corrupt `mysql.db` system table in XAMPP.

### Inventory Reservation Model (Bug Fix — Post Task 4.2)
- The original schema used `weightKg` (a single field) and flipped `available=false` on the entire inventory item when any order was placed — causing overselling and phantom stock disappearance.
- Fixed by renaming `weightKg` → `totalKg` and adding `reservedKg @default(0)` to the Inventory model, and adding `CANCELLED` to the `OrderStatus` enum.
- All controllers updated to use the three-column model. Migration: `inventory_reservation_model`.

## Notes for Next Session
- Phases 1, 2, 3, and 4 are fully complete.
- **Phase 5 Next:** PDF Receipt Generation — implement pdfkit receipt generation endpoint (GET /api/requests/:id/receipt), enable the disabled receipt button in homeuser/RequestDetail.jsx.
- **Phase 3 — Email Testing Blocked:** The VerifyEmail and ForgotPassword/ResetPassword flows are fully implemented (backend + frontend) but **cannot be tested yet** because `EMAIL_USER` and `EMAIL_PASS` have not been set in `backend/.env`.
  - To unblock: create a Gmail account for the app → enable 2-Step Verification → generate an App Password (Google → Security → App Passwords) → add to `backend/.env` as `EMAIL_USER` and `EMAIL_PASS`.
  - Once configured, test: Register new user → verify email link → login; and Forgot Password → reset link → reset password → login with new password.
  - Until then, newly registered users will be stuck at `isVerified=false` and cannot log in. Manually set `isVerified=true` in the DB to test other flows.
- Current Test User: `test@example.com` / `password123` (HOME_USER role).

