import { EXCHANGE_LABELS } from "./exchange-labels/dataset";
import { matchExchange } from "./exchange-labels/matcher";

const CHAINS = ["BTC", "ETH", "BSC", "TRX"];

export interface SimHop {
  from: string;
  to: string;
  amount: number;
  chain: string;
  txHash: string;
  timestamp: number;
  hopNumber: number;
}

export interface SimExchangeMatch {
  name: string;
  depositAddress: string;
  confidence: number;
}

export function seedFrom(addr: string): number {
  let h = 2166136261;
  for (let i = 0; i < addr.length; i++) {
    h ^= addr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed: number) {
  let s = seed;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

function fakeAddr(r: () => number, chain: string) {
  const hex = "0123456789abcdef";
  if (chain === "BTC")
    return "bc1q" + Array.from({ length: 38 }, () => "0123456789abcdefghjklmnpqrstuvwxyz"[Math.floor(r() * 34)]).join("");
  return "0x" + Array.from({ length: 40 }, () => hex[Math.floor(r() * 16)]).join("");
}

function fakeHash(r: () => number) {
  const hex = "0123456789abcdef";
  return "0x" + Array.from({ length: 64 }, () => hex[Math.floor(r() * 16)]).join("");
}

export function inferChainLabel(address: string): string {
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return "ETH";
  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address)) return "BTC";
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) return "TRX";
  return "ETH";
}

export function simulateTrace(address: string, chainLabel: string) {
  const r = rng(seedFrom(address.toLowerCase()));

  const hopCount = 2 + Math.floor(r() * 4);
  const hops: SimHop[] = [];
  let prev = address;
  let amount = 0.5 + r() * 9.5;
  // fixed epoch — sandbox output is fully deterministic, including timestamps,
  // so re-verification of the same address reproduces identical content hashes
  const now = 1756000000000;

  for (let i = 0; i < hopCount; i++) {
    const next = fakeAddr(r, chainLabel);
    const c = CHAINS[Math.floor(r() * CHAINS.length)];
    hops.push({
      from: prev,
      to: next,
      amount: Number(amount.toFixed(4)),
      chain: c,
      txHash: fakeHash(r),
      timestamp: now - (hopCount - i) * (60000 + Math.floor(r() * 300000)),
      hopNumber: i + 1,
    });
    prev = next;
    amount = amount * (0.3 + r() * 0.5);
  }

  let exchangeMatch: SimExchangeMatch | null = null;
  const candidates = EXCHANGE_LABELS.filter((e) => e.chain === chainLabel.toLowerCase());
  if (candidates.length && r() > 0.25) {
    const hit = candidates[Math.floor(r() * candidates.length)];
    const direct = matchExchange(address, chainLabel.toLowerCase());
    exchangeMatch = {
      name: hit.name,
      depositAddress: direct ? address : hit.address,
      confidence: direct ? 0.98 : Number((0.7 + r() * 0.25).toFixed(2)),
    };
    const last = hops[hops.length - 1];
    if (last) last.to = exchangeMatch.depositAddress;
  }

  const mixerContact = r() > 0.7;
  const riskScore = Math.min(
    99,
    Math.round(
      20 +
        hops.length * 9 +
        (exchangeMatch ? exchangeMatch.confidence * 30 : 10) +
        (mixerContact ? 18 : 0)
    )
  );

  return {
    hops,
    exchangeMatch,
    mixerContact,
    riskScore,
    riskBreakdown: {
      hopCount: hops.length,
      mixerContact,
      velocity: Number((0.3 + r() * 0.6).toFixed(2)),
      exchangeConfidence: exchangeMatch?.confidence ?? 0,
    },
  };
}
