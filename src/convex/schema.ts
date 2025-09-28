import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Travel logs table
    travelLogs: defineTable({
      userId: v.id("users"),
      title: v.string(),
      description: v.optional(v.string()),
      startDate: v.optional(v.number()),
      endDate: v.optional(v.number()),
      isActive: v.boolean(), // whether this log is currently being edited
    }).index("by_user", ["userId"]),

    // Destinations/markers within travel logs
    destinations: defineTable({
      travelLogId: v.id("travelLogs"),
      userId: v.id("users"),
      name: v.string(),
      latitude: v.number(),
      longitude: v.number(),
      notes: v.optional(v.string()),
      visitedDate: v.optional(v.number()),
      photos: v.optional(v.array(v.string())), // array of photo URLs
      category: v.optional(v.string()), // e.g., "restaurant", "attraction", "hotel"
    })
      .index("by_travel_log", ["travelLogId"])
      .index("by_user", ["userId"]),

    // Chat messages for the WanderBot
    chatMessages: defineTable({
      userId: v.id("users"),
      message: v.string(),
      isBot: v.boolean(),
      timestamp: v.number(),
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;