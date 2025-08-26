const mongoose = require("mongoose");

const personalityReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    personalityType: {
      type: String,
      required: true,
    },
    strengths: [
      {
        type: String,
        required: true,
      },
    ],
    growthAreas: [
      {
        type: String,
        required: true,
      },
    ],
    profile: {
      type: String,
      required: true,
    },
    messageCount: {
      type: Number,
      required: true,
      default: 0,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

personalityReportSchema.index({ conversationId: 1, version: -1 });
personalityReportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("PersonalityReport", personalityReportSchema);
