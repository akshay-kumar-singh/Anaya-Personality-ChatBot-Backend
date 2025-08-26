const PersonalityReport = require("../models/PersonalityReport");
const Conversation = require("../models/Conversation");

const savePersonalityReport = async (req, res, next) => {
  try {
    const {
      conversationId,
      personalityType,
      strengths,
      growthAreas,
      profile,
      messageCount,
    } = req.body;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const lastReport = await PersonalityReport.findOne({
      conversationId,
    }).sort({ version: -1 });

    const version = lastReport ? lastReport.version + 1 : 1;

    const report = new PersonalityReport({
      userId: req.user._id,
      conversationId,
      personalityType,
      strengths,
      growthAreas,
      profile,
      messageCount,
      version,
    });

    await report.save();

    await Conversation.findByIdAndUpdate(conversationId, {
      hasReports: true,
      reportCount: version,
    });

    res.status(201).json(report);
  } catch (error) {
    next(error);
  }
};

const getReportsByConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const reports = await PersonalityReport.find({
      conversationId,
      userId: req.user._id,
    }).sort({ version: -1 });

    res.json(reports);
  } catch (error) {
    next(error);
  }
};

const getLatestReport = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const report = await PersonalityReport.findOne({
      conversationId,
      userId: req.user._id,
    }).sort({ version: -1 });

    if (!report) {
      return res
        .status(404)
        .json({ error: "No reports found for this conversation" });
    }

    res.json(report);
  } catch (error) {
    next(error);
  }
};

const getUserReports = async (req, res, next) => {
  try {
    const reports = await PersonalityReport.find({
      userId: req.user._id,
    })
      .populate("conversationId", "title createdAt")
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    next(error);
  }
};

const deleteReport = async (req, res, next) => {
  try {
    const { reportId } = req.params;

    const report = await PersonalityReport.findOneAndDelete({
      _id: reportId,
      userId: req.user._id,
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const remainingReports = await PersonalityReport.countDocuments({
      conversationId: report.conversationId,
    });

    if (remainingReports === 0) {
      await Conversation.findByIdAndUpdate(report.conversationId, {
        hasReports: false,
        reportCount: 0,
      });
    } else {
      await Conversation.findByIdAndUpdate(report.conversationId, {
        reportCount: remainingReports,
      });
    }

    res.json({ message: "Report deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  savePersonalityReport,
  getReportsByConversation,
  getLatestReport,
  getUserReports,
  deleteReport,
};
