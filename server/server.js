require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  "http://localhost:5173,https://www.houserve.in,https://houserve.in"
)
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Render health checks)
      if (!origin) return callback(null, true);

      const isAllowed =
        origin.startsWith("http://localhost:") ||
        origin.startsWith("http://127.0.0.1:") ||
        origin.endsWith(".houserve.in") ||
        origin === "https://houserve.in" ||
        origin === "https://www.houserve.in" ||
        origin.endsWith(".vercel.app") ||
        allowedOrigins.includes(origin);

      callback(null, isAllowed);
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

// ---------- Routes ----------
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/services", require("./routes/serviceRoutes"));
app.use("/api/blogs", require("./routes/blogRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/properties", require("./routes/propertyRoutes"));

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("Missing MONGO_URI in environment.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.info("MongoDB connected");
    // Only listen if not running in a serverless environment like Vercel
    if (process.env.NODE_ENV !== 'production' || process.env.RENDER) {
      app.listen(PORT, () => {
        console.info(`Server running on port ${PORT}`);
      });
    }
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });

module.exports = app;
