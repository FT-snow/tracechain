import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { AlertType } from "./schema";

export const getByWatch = query({
  args: { watchId: v.id("watches") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("alerts")
      .withIndex("by_watch", (q) => q.eq("watchId", args.watchId))
      .order("desc")
      .take(20);
  },
});

export const getRecent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("alerts").order("desc").take(20);
  },
});

export const create = mutation({
  args: {
    watchId: v.id("watches"),
    type: AlertType,
    message: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const alertId = await ctx.db.insert("alerts", {
      watchId: args.watchId,
      type: args.type,
      message: args.message,
      data: args.data,
      createdAt: Date.now(),
    });
    const watch = await ctx.db.get(args.watchId);
    if (watch) {
      await ctx.db.patch(args.watchId, {
        alertCount: watch.alertCount + 1,
        triggeredAt: Date.now(),
      });
    }
    return alertId;
  },
});
