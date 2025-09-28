import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all travel logs for the current user
export const getUserTravelLogs = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("travelLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Get a specific travel log with its destinations
export const getTravelLog = query({
  args: { id: v.id("travelLogs") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const travelLog = await ctx.db.get(args.id);
    if (!travelLog || travelLog.userId !== user._id) {
      throw new Error("Travel log not found or access denied");
    }

    const destinations = await ctx.db
      .query("destinations")
      .withIndex("by_travel_log", (q) => q.eq("travelLogId", args.id))
      .collect();

    return {
      ...travelLog,
      destinations,
    };
  },
});

// Create a new travel log
export const createTravelLog = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Set any existing active logs to inactive
    const activeLogs = await ctx.db
      .query("travelLogs")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    for (const log of activeLogs) {
      await ctx.db.patch(log._id, { isActive: false });
    }

    return await ctx.db.insert("travelLogs", {
      userId: user._id,
      title: args.title,
      description: args.description,
      startDate: args.startDate,
      endDate: args.endDate,
      isActive: true,
    });
  },
});

// Update a travel log
export const updateTravelLog = mutation({
  args: {
    id: v.id("travelLogs"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const travelLog = await ctx.db.get(args.id);
    if (!travelLog || travelLog.userId !== user._id) {
      throw new Error("Travel log not found or access denied");
    }

    const updates: any = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.startDate !== undefined) updates.startDate = args.startDate;
    if (args.endDate !== undefined) updates.endDate = args.endDate;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.id, updates);
  },
});

// Delete a travel log
export const deleteTravelLog = mutation({
  args: { id: v.id("travelLogs") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const travelLog = await ctx.db.get(args.id);
    if (!travelLog || travelLog.userId !== user._id) {
      throw new Error("Travel log not found or access denied");
    }

    // Delete all destinations in this travel log
    const destinations = await ctx.db
      .query("destinations")
      .withIndex("by_travel_log", (q) => q.eq("travelLogId", args.id))
      .collect();

    for (const destination of destinations) {
      await ctx.db.delete(destination._id);
    }

    // Delete the travel log
    await ctx.db.delete(args.id);
  },
});

// Add sample data creator for the current user
export const createSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const start = now - 7 * 24 * 60 * 60 * 1000;

    const logId = await ctx.db.insert("travelLogs", {
      userId: user._id,
      title: "Manali Adventure",
      description:
        "A week exploring valleys, temples, and cafes in Manali.",
      startDate: start,
      endDate: now,
      isActive: true,
    });

    const sampleDestinations = [
      {
        name: "Hadimba Temple",
        latitude: 32.2435,
        longitude: 77.1887,
        category: "Temple",
        notes:
          "Ancient cedar wood temple in the middle of the forest.",
      },
      {
        name: "Solang Valley",
        latitude: 32.3164,
        longitude: 77.1556,
        category: "Adventure",
        notes:
          "Paragliding and zorbing with amazing mountain views.",
      },
      {
        name: "Old Manali",
        latitude: 32.257,
        longitude: 77.1893,
        category: "Neighborhood",
        notes:
          "Chill cafes, live music, and relaxed vibe.",
      },
    ] as const;

    for (const d of sampleDestinations) {
      await ctx.db.insert("destinations", {
        travelLogId: logId,
        userId: user._id,
        name: d.name,
        latitude: d.latitude,
        longitude: d.longitude,
        notes: d.notes,
        visitedDate: now,
        category: d.category,
      });
    }

    return logId;
  },
});