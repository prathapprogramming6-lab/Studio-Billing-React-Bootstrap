const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   MIDDLEWARE
========================= */

app.use(cors());

app.use(express.json());

/* =========================
   API ROUTES
========================= */

app.use("/api/auth", authRoutes);

app.use("/api/customers", customerRoutes);

app.use("/api/subscription", subscriptionRoutes);

app.use("/api/payment", paymentRoutes);

/* =========================
   HOME / SERVER CHECK
========================= */

app.get("/", (req, res) => {
  res.json({
    message:
      "Studio Billing Backend is running successfully!",
    database:
      mongoose.connection.readyState === 1
        ? "MongoDB Connected"
        : "MongoDB Not Connected"
  });
});

/* =========================
   MONGODB CONNECTION
========================= */

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log(
      "MongoDB connected successfully!"
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB connection failed:",
      error.message
    );
  });

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(
    `Studio Billing Backend running on http://localhost:${PORT}`
  );
});