const express = require("express");
const {
  openaiChat,
  analyzePersonality,
  generateQuestion,
} = require("../controllers/aiControllers");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.post("/chat", openaiChat);
router.post("/analyze-personality", analyzePersonality);
router.post("/generate-question", generateQuestion);

module.exports = router;
