import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { WalletType, Chain } from "./schema";

export const getByAddress = query({
  args: { address: v.string() },
  handler: async (ctx, args) => {
    const wallet = await ctx.db
      .query("wallets")
      .withIndex("by_address", (q) => q.eq("address", args.address))
      .first();
    return wallet ?? null;
  },
});

export const getRecent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("wallets")
      .order("desc")
      .take(20);
  },
});

export const upsert = mutation({
  args: {
    address: v.string(),
    chain: Chain,
    type: WalletType,
    label: v.optional(v.string()),
    riskScore: v.optional(v.number()),
    reportedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("wallets")
      .withIndex("by_address", (q) => q.eq("address", args.address))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        type: args.type,
        label: args.label ?? existing.label,
        riskScore: args.riskScore ?? existing.riskScore,
        flaggedCount: existing.flaggedCount + 1,
      });
      return existing._id;
    }
    return await ctx.db.insert("wallets", {
      address: args.address,
      chain: args.chain,
      type: args.type,
      label: args.label,
      riskScore: args.riskScore,
      reportedBy: args.reportedBy,
      flaggedCount: 1,
      firstSeen: Date.now(),
    });
  },
});
