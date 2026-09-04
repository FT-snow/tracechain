import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByTrace = query({
  args: { traceId: v.id("traces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("timelineEvents")
      .withIndex("by_trace", (q) => q.eq("traceId", args.traceId))
      .order("asc")
      .collect();
  },
});

export const add = mutation({
  args: {
    traceId: v.id("traces"),
    type: v.string(),
    message: v.string(),
    chain: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("timelineEvents", {
      traceId: args.traceId,
      type: args.type,
      message: args.message,
      chain: args.chain,
      timestamp: Date.now(),
    });
  },
});
