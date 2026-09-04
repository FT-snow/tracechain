import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByTrace = query({
  args: { traceId: v.id("traces") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reports")
      .withIndex("by_trace", (q) => q.eq("traceId", args.traceId))
      .first();
  },
});

export const generate = mutation({
  args: {
    traceId: v.id("traces"),
    pdfUrl: v.string(),
    freezeLetter: v.string(),
    sha256Hash: v.string(),
    annexureUrls: v.array(v.string()),
    language: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("reports")
      .withIndex("by_trace", (q) => q.eq("traceId", args.traceId))
      .first();
    if (existing) return existing._id;
    return await ctx.db.insert("reports", {
      traceId: args.traceId,
      pdfUrl: args.pdfUrl,
      freezeLetter: args.freezeLetter,
      sha256Hash: args.sha256Hash,
      annexureUrls: args.annexureUrls,
      generatedAt: Date.now(),
      language: args.language,
    });
  },
});
