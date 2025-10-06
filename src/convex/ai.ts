"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const generateWanderBotReply = action({
  args: {
    userMessage: v.string(),
    chatHistory: v.array(
      v.object({
        message: v.string(),
        isBot: v.boolean(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const systemPrompt =
      "You are WanderBot, an expert travel companion and advisor. You provide detailed, accurate travel information including:\n" +
      "- Destination recommendations with specific places, activities, and hidden gems\n" +
      "- Practical travel tips (visas, budgets, safety, best times to visit)\n" +
      "- Cultural insights and local customs\n" +
      "- Food and restaurant recommendations\n" +
      "- Itinerary planning with day-by-day suggestions\n" +
      "- App-specific help for adding places to travel logs\n\n" +
      "Be conversational, enthusiastic, and thorough. Use emojis sparingly for visual appeal. " +
      "When users ask complex questions, provide comprehensive answers with multiple perspectives. " +
      "Format longer responses with clear sections and bullet points for readability.";

    // Graceful fallback if no key configured
    if (!apiKey) {
      return (
        "I'm running in demo mode. Add an OpenRouter API key to enable real AI responses.\n\n" +
        "Meanwhile, here are some helpful tips:\n" +
        "• Tell me a destination and your trip length for a quick itinerary.\n" +
        "• Ask for budget tips, best time to visit, or food recommendations.\n" +
        "• App help: Click 'Add Place', then click the map to autofill name & coordinates; add notes and save."
      );
    }

    try {
      // Convert chat history to OpenAI message format
      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...args.chatHistory.map((msg) => ({
          role: (msg.isBot ? "assistant" : "user") as "assistant" | "user",
          content: msg.message,
        })),
        {
          role: "user" as const,
          content: args.userMessage.trim(),
        },
      ];

      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://beyond-borders.app",
          "X-Title": "Beyond Borders Travel App",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3.5-sonnet",
          messages,
          temperature: 0.7,
          max_tokens: 800,
          top_p: 1,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        console.error(`OpenRouter error: ${resp.status} ${text}`);
        
        // If Claude fails, try GPT-4 as fallback
        const fallbackResp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": "https://beyond-borders.app",
            "X-Title": "Beyond Borders Travel App",
          },
          body: JSON.stringify({
            model: "openai/gpt-4-turbo",
            messages,
            temperature: 0.7,
            max_tokens: 800,
          }),
        });

        if (!fallbackResp.ok) {
          throw new Error("Both primary and fallback models failed");
        }

        const fallbackData = await fallbackResp.json();
        return (
          fallbackData?.choices?.[0]?.message?.content?.trim() ||
          "I couldn't generate a response right now. Please try again."
        );
      }

      const data = await resp.json();
      const content =
        data?.choices?.[0]?.message?.content?.trim() ||
        "I couldn't generate a response right now. Please try again.";
      return content;
    } catch (err) {
      console.error("AI generation error:", err);
      return (
        "I had trouble connecting to the AI service. Please try again shortly.\n\n" +
        "Quick help:\n" +
        "• Add a place: Click 'Add Place' → click the map → edit details in the sidebar → Add to Log.\n" +
        "• Share a destination + number of days for a mini itinerary."
      );
    }
  },
});