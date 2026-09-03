import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const WalletType = v.union(
  v.literal("unknown"),
  v.literal("exchange"),
  v.literal("mixer"),
  v.literal("victim"),
  v.literal("suspect")
);

export const Chain = v.union(
  v.literal("btc"),
  v.literal("eth"),
  v.literal("bsc"),
  v.literal("tron")
);

export const TraceStatus = v.union(
  v.literal("pending"),
  v.literal("tracing"),
  v.literal("complete"),
  v.literal("incomplete")
);

export const CaseStatus = v.union(
  v.literal("open"),
  v.literal("traced"),
  v.literal("freeze_requested"),
  v.literal("closed")
);

export const AlertType = v.union(
  v.literal("movement"),
  v.literal("exchange_landing"),
  v.literal("new_flag")
);

export default defineSchema({
  wallets: defineTable({
    address: v.string(),
    chain: Chain,
    label: v.optional(v.string()),
    type: WalletType,
    riskScore: v.optional(v.number()),
    reportedBy: v.optional(v.string()),
    flaggedCount: v.number(),
    firstSeen: v.number(),
  }).index("by_address", ["address"]).index("by_chain", ["chain"]),

  traces: defineTable({
    walletId: v.id("wallets"),
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
    exchangeMatch: v.optional(
      v.object({
        name: v.string(),
        depositAddress: v.string(),
        confidence: v.number(),
        accountHint: v.optional(v.string()),
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
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_wallet", ["walletId"]).index("by_status", ["status"]),

  reports: defineTable({
    traceId: v.id("traces"),
    pdfUrl: v.string(),
    freezeLetter: v.string(),
    annexureUrls: v.array(v.string()),
    sha256Hash: v.string(),
    generatedAt: v.number(),
    language: v.string(),
  }).index("by_trace", ["traceId"]),

  watches: defineTable({
    walletId: v.id("wallets"),
    active: v.boolean(),
    lastChecked: v.number(),
    alertCount: v.number(),
    triggeredAt: v.optional(v.number()),
  }).index("by_wallet", ["walletId"]),

  alerts: defineTable({
    watchId: v.id("watches"),
    type: AlertType,
    message: v.string(),
    data: v.any(),
    createdAt: v.number(),
  }).index("by_watch", ["watchId"]),

  cases: defineTable({
    title: v.string(),
    officerId: v.string(),
    traceIds: v.array(v.id("traces")),
    status: CaseStatus,
    state: v.string(),
    district: v.string(),
    createdAt: v.number(),
    victimTrackingId: v.optional(v.string()),
  }).index("by_status", ["status"]).index("by_state", ["state"]),

  correlations: defineTable({
    walletCluster: v.array(v.string()),
    caseIds: v.array(v.id("cases")),
    strength: v.number(),
    discoveredAt: v.number(),
  }),

  timelineEvents: defineTable({
    traceId: v.id("traces"),
    type: v.string(),
    message: v.string(),
    chain: v.optional(v.string()),
    timestamp: v.number(),
  }).index("by_trace", ["traceId"]),

  advisoryFlags: defineTable({
    walletId: v.id("wallets"),
    source: v.union(v.literal("RBI"), v.literal("FIU"), v.literal("community")),
    note: v.string(),
    flaggedAt: v.number(),
  }).index("by_wallet", ["walletId"]),
});
