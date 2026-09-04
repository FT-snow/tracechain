import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByWallet = query({
  args: { walletId: v.id("wallets") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("watches")
      .withIndex("by_wallet", (q) => q.eq("walletId", args.walletId))
      .first();
  },
});

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const watches = await ctx.db.query("watches").collect();
    return watches.filter((w) => w.active);
  },
});

export const toggle = mutation({
  args: {
    walletId: v.id("wallets"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("watches")
      .withIndex("by_wallet", (q) => q.eq("walletId", args.walletId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { active: !existing.active });
      return existing._id;
    }
    return await ctx.db.insert("watches", {
      walletId: args.walletId,
      active: true,
      lastChecked: Date.now(),
      alertCount: 0,
    });
  },
});
