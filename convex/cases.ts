import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getRecent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("cases").order("desc").take(20);
  },
});

export const getById = query({
  args: { id: v.id("cases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByStatus = query({
  args: { status: v.union(v.literal("open"), v.literal("traced"), v.literal("freeze_requested"), v.literal("closed")) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cases")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    officerId: v.string(),
    traceIds: v.array(v.id("traces")),
    state: v.string(),
    district: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cases", {
      title: args.title,
      officerId: args.officerId,
      traceIds: args.traceIds,
      status: "open",
      state: args.state,
      district: args.district,
      createdAt: Date.now(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    caseId: v.id("cases"),
    status: v.union(v.literal("open"), v.literal("traced"), v.literal("freeze_requested"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.caseId, { status: args.status });
  },
});
