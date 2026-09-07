export interface Hop {
  from: string;
  to: string;
  amount: number;
  chain: string;
  txHash: string;
  timestamp: number;
  hopNumber: number;
  type: "wallet" | "exchange" | "mixer" | "victim";
  label?: string;
}

export interface TraceResult {
  id: string;
  victimAddress: string;
  status: "pending" | "tracing" | "complete" | "incomplete";
  hops: Hop[];
  exchangeMatch?: {
    name: string;
    depositAddress: string;
    confidence: number;
    accountHint?: string;
  };
  riskScore: number;
  riskBreakdown: {
    hopCount: number;
    mixerContact: boolean;
    velocity: number;
    exchangeConfidence: number;
    socialProof: number;
  };
  bridgeDetected: boolean;
  startedAt: number;
  completedAt?: number;
}

export const VICTIM_ADDRESS = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const now = Date.now();

export function buildDemoTrace(): TraceResult {
  return {
    id: "tr_9f3a71c2",
    victimAddress: VICTIM_ADDRESS,
    status: "complete",
    hops: [
      {
        from: VICTIM_ADDRESS,
        to: "0x1f2aB8c3D4e5F60718293a4b5C6d7E8f9A0b1C2",
        amount: 0.5,
        chain: "eth",
        txHash: "0x9c2f1d7e8a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d",
        timestamp: now - 3600 * 1000,
        hopNumber: 1,
        type: "wallet",
      },
      {
        from: "0x1f2aB8c3D4e5F60718293a4b5C6d7E8f9A0b1C2",
        to: "0x3c4dE5f6A7b8C9d0E1f2a3B4c5D6e7F8a9b0C1D",
        amount: 0.48,
        chain: "eth",
        txHash: "0xa1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d",
        timestamp: now - 2100 * 1000,
        hopNumber: 2,
        type: "mixer",
        label: "Tornado Cash mixer",
      },
      {
        from: "0x3c4dE5f6A7b8C9d0E1f2a3B4c5D6e7F8a9b0C1D",
        to: "0x5e6f7A8b9C0d1E2f3a4B5c6D7e8F9a0b1C2d3E",
        amount: 0.46,
        chain: "eth",
        txHash: "0xb2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b",
        timestamp: now - 900 * 1000,
        hopNumber: 3,
        type: "wallet",
      },
      {
        from: "0x5e6f7A8b9C0d1E2f3a4B5c6D7e8F9a0b1C2d3E",
        to: "0x28C6c06298d514Db089934071355E5743bf21d60",
        amount: 0.45,
        chain: "eth",
        txHash: "0xc3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
        timestamp: now - 240 * 1000,
        hopNumber: 4,
        type: "exchange",
        label: "Binance — Deposit Wallet",
      },
    ],
    exchangeMatch: {
      name: "Binance",
      depositAddress: "0x28C6c06298d514Db089934071355E5743bf21d60",
      confidence: 94,
      accountHint: "Binance Hot Wallet — inbound via ETH",
    },
    riskScore: 87,
    riskBreakdown: {
      hopCount: 4,
      mixerContact: true,
      velocity: 82,
      exchangeConfidence: 94,
      socialProof: 71,
    },
    bridgeDetected: false,
    startedAt: now - 3900 * 1000,
    completedAt: now - 200 * 1000,
  };
}

export const demoCorrelations = [
  {
    id: "cor_01",
    walletCluster: ["0x28C6c06298d514Db089934071355E5743bf21d60"],
    caseIds: ["case_01", "case_04", "case_09"],
    strength: 88,
    note: "4 victims converge on same Binance deposit wallet",
  },
  {
    id: "cor_02",
    walletCluster: ["0x7a9b...c3d4"],
    caseIds: ["case_02", "case_07"],
    strength: 76,
    note: "Common-input cluster — likely same operator",
  },
];

export const demoAlerts = [
  { id: "al_1", type: "exchange_landing", message: "Trace resolved to Binance Deposit Wallet", time: now - 200 * 1000, severity: "high" },
  { id: "al_2", type: "movement", message: "Dormant fund moved: 0x3c4d…C1D → new address", time: now - 3000 * 1000, severity: "high" },
  { id: "al_3", type: "new_flag", message: "3 new victims flagged 0x7a25…488D", time: now - 4700 * 1000, severity: "med" },
];

export type Severity = "danger" | "normal" | "safe";

export const demoHeatmap: {
  state: string;
  district: string;
  count: number;
  severity: Severity;
}[] = [
  { state: "DL", district: "Delhi", count: 42, severity: "danger" },
  { state: "HR", district: "Gurugram", count: 36, severity: "normal" },
  { state: "MH", district: "Mumbai", count: 51, severity: "danger" },
  { state: "KA", district: "Bengaluru", count: 33, severity: "normal" },
  { state: "TN", district: "Chennai", count: 27, severity: "normal" },
  { state: "UP", district: "Lucknow", count: 24, severity: "normal" },
  { state: "GJ", district: "Ahmedabad", count: 19, severity: "safe" },
  { state: "WB", district: "Kolkata", count: 22, severity: "normal" },
  { state: "RJ", district: "Jaipur", count: 15, severity: "safe" },
  { state: "MP", district: "Bhopal", count: 12, severity: "safe" },
];
