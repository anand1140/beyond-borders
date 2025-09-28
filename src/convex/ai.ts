"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";

export const generateWanderBotReply = action({
  args: {
    userMessage: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const systemPrompt =
      "You are WanderBot, a friendly travel companion. Provide concise, practical travel tips, destination suggestions, and app-specific help for adding places to a travel log. Prefer bullet points for lists. Keep responses under 180 words.";

    // Graceful fallback if no key configured
    if (!apiKey) {
      return (
        "I’m running in demo mode. Add an OpenRouter API key to enable real AI responses.\n\n" +
        "Meanwhile, here are some helpful tips:\n" +
        "• Tell me a destination and your trip length for a quick itinerary.\n" +
        "• Ask for budget tips, best time to visit, or food recommendations.\n" +
        "• App help: Click “Add Place”, then click the map to autofill name & coordinates; add notes and save."
      );
    }

    try {
      const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          // Choose a widely available open-source model
          model: "openrouter/auto",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: args.userMessage.trim(),
            },
          ],
          temperature: 0.6,
          max_tokens: 300,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text().catch(() => "");
        throw new Error(`OpenRouter error: ${resp.status} ${text}`); // falls to catch for fallback
      }

      const data = await resp.json();
      const content =
        data?.choices?.[0]?.message?.content?.trim() ||
        "I couldn’t generate a response right now. Please try again.";
      return content;
    } catch (err) {
      return (
        "I had trouble connecting to the AI service. Please try again shortly.\n\n" +
        "Quick help:\n" +
        "• Add a place: Click “Add Place” → click the map → edit details in the sidebar → Add to Log.\n" +
        "• Share a destination + number of days for a mini itinerary."
      );
    }
  },
});
