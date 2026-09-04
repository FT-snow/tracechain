import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { TraceStatus } from "./schema";

export const getByWallet = query({
  args: { walletId: v.id("wallets") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("traces")
      .withIndex("by_wallet", (q) => q.eq("walletId", args.walletId))
      .order("desc")
      .first();
  },
});

export const getById = query({
  args: { id: v.id("traces") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("traces")
      .withIndex("by_status", (q) => q.eq("status", "tracing"))
      .collect();
  },
});

export const startTrace = mutation({
  args: {
    walletId: v.id("wallets"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("traces", {
      walletId: args.walletId,
      status: "pending",
      hops: [],
      riskScore: 0,
      riskBreakdown: {
        hopCount: 0,
        mixerContact: false,
        velocity: 0,
        exchangeConfidence: 0,
        socialProof: 0,
      },
      bridgeDetected: false,
      startedAt: Date.now(),
    });
  },
});

export const updateProgress = mutation({
  args: {
    traceId: v.id("traces"),
    status: TraceStatus,
    hops: v.array(
      v.object({
        from: v.string(),
        to: v.string(),
        amount: v.number(),
        chain: v.string(),
        txHash: v.string(),
        timestamp: v.number(),
        hopNumber: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.traceId, {
      status: args.status,
      hops: args.hops,
    });
  },
});

export const completeTrace = mutation({
  args: {
    traceId: v.id("traces"),
    hops: v.array(
      v.object({
        from: v.string(),
        to: v.string(),
        amount: v.number(),
        chain: v.string(),
        txHash: v.string(),
        timestamp: v.number(),
        hopNumber: v.number(),
      })
    ),
    exchangeMatch: v.optional(
      v.object({
        name: v.string(),
        depositAddress: v.string(),
        confidence: v.number(),
      })
    ),
    riskScore: v.number(),
    riskBreakdown: v.object({
      hopCount: v.number(),
      mixerContact: v.boolean(),
      velocity: v.number(),
      exchangeConfidence: v.number(),
      socialProof: v.number(),
    }),
    bridgeDetected: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.traceId, {
      status: "complete",
      hops: args.hops,
      exchangeMatch: args.exchangeMatch,
      riskScore: args.riskScore,
      riskBreakdown: args.riskBreakdown,
      bridgeDetected: args.bridgeDetected,
      completedAt: Date.now(),
    });
  },
});
