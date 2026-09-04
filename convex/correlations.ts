import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getRecent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("correlations").order("desc").take(20);
  },
});

export const create = mutation({
  args: {
    walletCluster: v.array(v.string()),
    caseIds: v.array(v.id("cases")),
    strength: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("correlations", {
      walletCluster: args.walletCluster,
      caseIds: args.caseIds,
      strength: args.strength,
      discoveredAt: Date.now(),
    });
  },
});
