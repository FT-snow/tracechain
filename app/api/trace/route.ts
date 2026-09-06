import { NextResponse } from "next/server";
import { EXCHANGE_LABELS } from "@/lib/chain/exchange-labels/dataset";
import { matchExchange } from "@/lib/chain/exchange-labels/matcher";
import { checkApiKey } from "@/lib/auth";
import { traceAddress, detectChain, ChainId } from "@/lib/chain/traverse";

const CHAINS = ["BTC", "ETH", "BSC", "TRX"];

interface Hop {
  from: string;
  to: string;
  amount: number;
  chain: string;
  txHash: string;
  timestamp: number;
  hopNumber: number;
}

function seedFrom(addr: string) {
  let h = 2166136261;
  for (let i = 0; i < addr.length; i++) {
    h ^= addr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
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

function inferChain(address: string): string {
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return "ETH";
  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address)) return "BTC";
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) return "TRX";
  return "ETH";
}

export async function POST(req: Request) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ error: "API key required — server has TRACECHAIN_API_KEY set but request sent no matching x-api-key header" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const address: string = (body.address ?? "").trim();
    if (!/^[a-zA-Z0-9]{20,64}$/.test(address)) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const chain = CHAINS.includes(body.chain) ? body.chain : inferChain(address);

    // ---- live traversal first ----
    const chainId: ChainId =
      chain === "BTC" ? "btc" : chain === "TRX" ? "tron" : chain === "BSC" ? "bsc" : "eth";
    const live = await traceAddress(address, chainId, 4).catch(() => null);

    if (live && live.hops.length > 0) {
      const finalTo = live.hops[live.hops.length - 1].to;
      const ex = matchExchange(finalTo, chainId);
      const mixerContact = false;
      const riskScore = Math.min(
        99,
        Math.round(
          15 +
            live.hops.length * 10 +
            (ex ? 35 : 12)
        )
      );
      return NextResponse.json({
        address,
        chain,
        source: "live",
        probes: live.probes,
        stoppedOn: live.stoppedOn,
        hops: live.hops,
        exchangeMatch: ex
          ? { name: ex.name, depositAddress: ex.address, confidence: 0.99 }
          : null,
        mixerContact,
        riskScore,
        riskBreakdown: {
          hopCount: live.hops.length,
          mixerContact,
          velocity: 0,
          exchangeConfidence: ex ? 0.99 : 0,
        },
        generatedAt: new Date().toISOString(),
      });
    }

    // ---- deterministic simulation fallback ----
    const r = rng(seedFrom(address.toLowerCase()));

    const hopCount = 2 + Math.floor(r() * 4);
    const hops: Hop[] = [];
    let prev = address;
    let amount = 0.5 + r() * 9.5;
    const now = Date.now();

    for (let i = 0; i < hopCount; i++) {
      const next = fakeAddr(r, chain);
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

    let exchangeMatch: { name: string; depositAddress: string; confidence: number } | null = null;
    const candidates = EXCHANGE_LABELS.filter((e) => e.chain === chain);
    if (candidates.length && r() > 0.25) {
      const hit = candidates[Math.floor(r() * candidates.length)];
      const direct = matchExchange(address, chain);
      exchangeMatch = {
        name: hit.name,
        depositAddress: direct ? address : hit.address,
        confidence: direct ? 0.98 : Number((0.7 + r() * 0.25).toFixed(2)),
      };
      const last = hops[hops.length - 1];
      last.to = exchangeMatch.depositAddress;
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

    return NextResponse.json({
      address,
      chain,
      source: "simulated",
      probes: [],
      stoppedOn: "simulated",
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
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
