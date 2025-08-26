const express = require("express");
const authRoutes = require("./auth");
const conversationRoutes = require("./conversation");
const aiRoutes = require("./ai");
const personalityRoutes = require("./personalityRoutes");
const router = express.Router();

router.use("/auth", authRoutes);
router.use("/conversations", conversationRoutes);
router.use("/ai", aiRoutes);
router.use("/personality-reports", personalityRoutes);

router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
