const express = require("express");
const {
  getConversations,
  createConversation,
  getConversationById,
  updateConversation,
  addMessage,
  deleteConversation,
} = require("../controllers/conversationController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.route("/").get(getConversations).post(createConversation);

router
  .route("/:id")
  .get(getConversationById)
  .put(updateConversation)
  .delete(deleteConversation);

router.post("/:id/messages", addMessage);

module.exports = router;
