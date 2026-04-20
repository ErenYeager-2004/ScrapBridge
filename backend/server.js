import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// ── Route Imports ──────────────────────────────────────────────────────────────
import authRoutes         from "./src/routes/auth.routes.js";
import requestRoutes      from "./src/routes/request.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";

// ESM __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Global Middleware ──────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

// ── Static Files ───────────────────────────────────────────────────────────────
// Uploaded images served at /uploads/<filename>
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth",          authRoutes);
app.use("/api/requests",      requestRoutes);
app.use("/api/notifications", notificationRoutes);

// ── Health Check ───────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// ── Start Server ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ ScrapBridge server running on http://localhost:${PORT}`);
});

export default app;
