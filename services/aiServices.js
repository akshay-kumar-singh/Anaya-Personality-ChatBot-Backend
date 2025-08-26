import { API_CONFIG } from "../api/config.js";

const AI_SERVICE_ENDPOINTS = {
  OPENAI_CHAT: `${API_CONFIG.BASE_URL}/ai/openai-chat`,
  GEMINI_CHAT: `${API_CONFIG.BASE_URL}/ai/gemini-chat`,
  ANALYZE_PERSONALITY: `${API_CONFIG.BASE_URL}/ai/analyze-personality`,
  GENERATE_SUGGESTIONS: `${API_CONFIG.BASE_URL}/ai/generate-suggestions`,
};

export const aiService = {
  sendToOpenAI: async (messages, context = {}) => {
    try {
      const response = await fetch(AI_SERVICE_ENDPOINTS.OPENAI_CHAT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages, context }),
      });

      if (!response.ok) {
        throw new Error("Failed to get OpenAI response");
      }

      return await response.json();
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw error;
    }
  },

  sendToGemini: async (messages, context = {}) => {
    try {
      const response = await fetch(AI_SERVICE_ENDPOINTS.GEMINI_CHAT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages, context }),
      });

      if (!response.ok) {
        throw new Error("Failed to get Gemini response");
      }

      return await response.json();
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  },

  analyzePersonality: async (conversationHistory) => {
    try {
      const response = await fetch(AI_SERVICE_ENDPOINTS.ANALYZE_PERSONALITY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ conversationHistory }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze personality");
      }

      return await response.json();
    } catch (error) {
      console.error("Personality Analysis Error:", error);
      throw error;
    }
  },

  generateSuggestions: async (userMessage, conversationHistory) => {
    try {
      const response = await fetch(AI_SERVICE_ENDPOINTS.GENERATE_SUGGESTIONS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userMessage, conversationHistory }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate suggestions");
      }

      return await response.json();
    } catch (error) {
      console.error("Suggestions Generation Error:", error);
      throw error;
    }
  },
};
