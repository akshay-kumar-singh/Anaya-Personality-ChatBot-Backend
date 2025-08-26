const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/database");
const errorHandler = require("./middleware/errorHandler");
const routes = require("./routes");

const app = express();

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({
    message: "Personality API",
    version: "1.0.0",
    status: "Active",
  });
});

app.use(errorHandler);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
