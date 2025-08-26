const OpenAI = require("openai");
const PersonalityReport = require("../models/PersonalityReport");
const Conversation = require("../models/Conversation");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PERSONALITY_ANALYSIS_PROMPT = `
You are a professional personality analyst. Based on the conversation history provided, analyze the user's personality traits, communication style, emotional patterns, and behavioral tendencies. 

Provide a comprehensive personality report with:
1. Personality Type (e.g., Pragmatic, Empathetic, Analytical, Creative, etc.)
2. Key Strengths (3-4 points)
3. Areas for Growth (3-4 points)
4. Detailed Profile (2-3 paragraphs explaining their personality, motivations, and behavioral patterns)

Format the response as a JSON object with the structure:
{
  "personalityType": "string",
  "strengths": ["string"],
  "growthAreas": ["string"],
  "profile": "string"
}
`;

const QUESTION_PROMPT = `
Based on the user's response, generate a follow-up multiple choice question that would help understand their personality better. 

The question should be:
- Direct and clear
- Personality-revealing
- Have 4-5 options that are mutually exclusive where possible
- Options should be short (2-3 words)

Return as a JSON object with the structure:
{
  "question": "Your question here?",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
}
`;

const PERSONALITY_BOT_PROMPT = `
You are a friendly personality analysis chatbot. Your goal is to understand the user's personality through natural conversation. 

Guidelines:
- Be warm, empathetic, and encouraging
- Ask insightful questions about their feelings, behaviors, preferences, and experiences
- Respond thoughtfully to their answers
- Keep responses concise but meaningful
- Make the conversation feel natural, not like an interview
- Show genuine interest in their responses
- Use encouraging language and validate their feelings
- Gradually explore different aspects of their personality

Start each new conversation with: "Hello! I'm a chatbot designed to understand your personality. To begin, please tell me a little about yourself."
`;

const openaiChat = async (req, res, next) => {
  try {
    const { messages, context } = req.body;

    const systemMessage = {
      role: "system",
      content:
        PERSONALITY_BOT_PROMPT +
        (context?.isFirstMessage
          ? ""
          : ` Previous context: ${JSON.stringify(context)}`),
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500,
    });

    res.json({
      message: completion.choices[0].message.content,
      usage: completion.usage,
    });
  } catch (error) {
    console.error("OpenAI Error:", error);
    next(error);
  }
};

const analyzePersonality = async (req, res, next) => {
  try {
    const { conversationHistory, conversationId, messageCount } = req.body;

    const conversationText = conversationHistory
      .map((msg) => `${msg.type}: ${msg.content}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: PERSONALITY_ANALYSIS_PROMPT,
        },
        {
          role: "user",
          content: `Please analyze this conversation:\n\n${conversationText}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const analysis = JSON.parse(completion.choices[0].message.content);

    if (conversationId && req.user) {
      try {
        const lastReport = await PersonalityReport.findOne({
          conversationId,
        }).sort({ version: -1 });

        const version = lastReport ? lastReport.version + 1 : 1;

        const report = new PersonalityReport({
          userId: req.user._id,
          conversationId,
          personalityType: analysis.personalityType,
          strengths: analysis.strengths,
          growthAreas: analysis.growthAreas,
          profile: analysis.profile,
          messageCount: messageCount || 0,
          version,
        });

        await report.save();

        await Conversation.findByIdAndUpdate(conversationId, {
          hasReports: true,
          reportCount: version,
        });

        analysis.reportId = report._id;
        analysis.version = version;
      } catch (saveError) {
        console.error("Error saving personality report:", saveError);
      }
    }

    res.json(analysis);
  } catch (error) {
    console.error("Personality Analysis Error:", error);
    res.json({
      personalityType: "Unique Individual",
      strengths: ["Self-aware", "Communicative", "Reflective"],
      growthAreas: ["Continue self-exploration", "Embrace new experiences"],
      profile:
        "Based on our conversation, you demonstrate thoughtful communication and self-reflection. You're open to exploring your personality and sharing your thoughts, which shows emotional intelligence and a desire for personal growth.",
    });
  }
};

const generateQuestion = async (req, res, next) => {
  try {
    const { userMessage, conversationHistory } = req.body;

    const context = conversationHistory
      .slice(-6)
      .map((msg) => `${msg.type}: ${msg.content}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: QUESTION_PROMPT,
        },
        {
          role: "user",
          content: `Recent conversation:\n${context}\n\nLatest user message: ${userMessage}\n\nGenerate a multiple choice question:`,
        },
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const questionData = JSON.parse(completion.choices[0].message.content);

    res.json(questionData);
  } catch (error) {
    console.error("Question Generation Error:", error);
    res.json({
      question: "How often do you find yourself smiling?",
      options: ["Almost always", "Frequently", "Sometimes", "Rarely"],
    });
  }
};

module.exports = {
  openaiChat,
  analyzePersonality,
  generateQuestion,
};
