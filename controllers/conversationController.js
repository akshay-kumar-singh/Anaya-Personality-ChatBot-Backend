const Conversation = require("../models/Conversation");
const PersonalityReport = require("../models/PersonalityReport");

const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({ userId: req.user._id })
      .select("title createdAt hasReports reportCount")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

const createConversation = async (req, res, next) => {
  try {
    const { title, message } = req.body;

    const conversation = new Conversation({
      userId: req.user._id,
      title: title || "New Chat",
      hasReports: false,
      reportCount: 0,
      messages: message
        ? [
            {
              type: "user",
              content: message,
            },
          ]
        : [],
    });

    await conversation.save();
    res.status(201).json(conversation);
  } catch (error) {
    next(error);
  }
};

const getConversationById = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json(conversation);
  } catch (error) {
    next(error);
  }
};

const updateConversation = async (req, res, next) => {
  try {
    const { title } = req.body;

    const conversation = await Conversation.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user._id,
      },
      { title },
      { new: true }
    );

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    res.json(conversation);
  } catch (error) {
    next(error);
  }
};

const addMessage = async (req, res, next) => {
  try {
    const { content, type } = req.body;

    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    conversation.messages.push({
      type: type || "user",
      content,
    });

    await conversation.save();
    res.json(conversation);
  } catch (error) {
    next(error);
  }
};

const deleteConversation = async (req, res, next) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    await PersonalityReport.deleteMany({
      conversationId: req.params.id,
      userId: req.user._id,
    });

    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getConversations,
  createConversation,
  getConversationById,
  updateConversation,
  addMessage,
  deleteConversation,
};
