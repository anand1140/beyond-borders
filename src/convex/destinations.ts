import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Add a destination to a travel log
export const addDestination = mutation({
  args: {
    travelLogId: v.id("travelLogs"),
    name: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    notes: v.optional(v.string()),
    visitedDate: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    // Verify the travel log belongs to the user
    const travelLog = await ctx.db.get(args.travelLogId);
    if (!travelLog || travelLog.userId !== user._id) {
      throw new Error("Travel log not found or access denied");
    }

    return await ctx.db.insert("destinations", {
      travelLogId: args.travelLogId,
      userId: user._id,
      name: args.name,
      latitude: args.latitude,
      longitude: args.longitude,
      notes: args.notes,
      visitedDate: args.visitedDate,
      category: args.category,
    });
  },
});

// Update a destination
export const updateDestination = mutation({
  args: {
    id: v.id("destinations"),
    name: v.optional(v.string()),
    notes: v.optional(v.string()),
    visitedDate: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const destination = await ctx.db.get(args.id);
    if (!destination || destination.userId !== user._id) {
      throw new Error("Destination not found or access denied");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.visitedDate !== undefined) updates.visitedDate = args.visitedDate;
    if (args.category !== undefined) updates.category = args.category;

    await ctx.db.patch(args.id, updates);
  },
});

// Delete a destination
export const deleteDestination = mutation({
  args: { id: v.id("destinations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    const destination = await ctx.db.get(args.id);
    if (!destination || destination.userId !== user._id) {
      throw new Error("Destination not found or access denied");
    }

    await ctx.db.delete(args.id);
  },
});

// Get destinations for a travel log
export const getDestinations = query({
  args: { travelLogId: v.id("travelLogs") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("destinations")
      .withIndex("by_travel_log", (q) => q.eq("travelLogId", args.travelLogId))
      .collect();
  },
});
