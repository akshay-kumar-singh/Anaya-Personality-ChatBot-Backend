const express = require("express");
const {
  savePersonalityReport,
  getReportsByConversation,
  getLatestReport,
  getUserReports,
  deleteReport,
} = require("../controllers/personalityReportController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get("/", getUserReports);

router.get("/conversation/:conversationId", getReportsByConversation);

router.get("/conversation/:conversationId/latest", getLatestReport);

router.post("/", savePersonalityReport);

router.delete("/:reportId", deleteReport);

module.exports = router;
