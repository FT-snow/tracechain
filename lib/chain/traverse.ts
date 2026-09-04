import {
  getEthOutgoing,
  getEthTokenTransfers,
  getBscOutgoing,
  getBscTokenTransfers,
  parseEthValue,
  hasEtherscanKey,
} from "./etherscan";
import { getBlockscoutEthCandidates } from "./blockscout";
import { getTrc20Outgoing, parseTronValue } from "./tronscan";
import { getBtcOutgoing } from "./btc";
import { matchExchange } from "./exchange-labels/matcher";

export type ChainId = "eth" | "btc" | "bsc" | "tron";

export interface TraverseHop {
  from: string;
  to: string;
  amount: number;
  chain: string;
  txHash: string;
  timestamp: number;
  hopNumber: number;
}

export interface TraverseOutcome {
  hops: TraverseHop[];
  source: "live";
  probes: string[];
  stoppedOn: "exchange" | "dead-end" | "max-depth" | "no-data";
  exchangeName?: string;
  note?: string;
}

export function detectChain(address: string): ChainId {
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) return "eth";
  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address)) return "btc";
  if (/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) return "tron";
  return "eth";
}

interface Candidate {
  to: string;
  amount: number;
  txHash: string;
  timestamp: number;
  isToken: boolean;
}

async function evmCandidates(
  chain: "eth" | "bsc",
  address: string
): Promise<{ cands: Candidate[]; ok: boolean; note: string }> {
  // Keyless Blockscout first for ETH; Etherscan V2 needs a real key (covers ETH + BSC)
  if (chain === "eth") {
    const bs = await getBlockscoutEthCandidates(address);
    if (bs.ok) return { cands: bs.cands.slice(0, 3), ok: true, note: "" };
    if (!hasEtherscanKey()) {
      return { cands: [], ok: false, note: "blockscout down and no etherscan key" };
    }
  }
  if (chain === "bsc" && !hasEtherscanKey()) {
    return { cands: [], ok: false, note: "bsc needs a real etherscan key" };
  }

  const [native, tokens] =
    chain === "eth"
      ? await Promise.all([getEthOutgoing(address), getEthTokenTransfers(address)])
      : await Promise.all([getBscOutgoing(address), getBscTokenTransfers(address)]);
  if (!native.ok || !tokens.ok) {
    return {
      cands: [],
      ok: false,
      note: native.message ?? tokens.message ?? "etherscan rejected",
    };
  }
  const cands: Candidate[] = native.txs.map((t) => ({
    to: t.to,
    amount: parseEthValue(t.value),
    txHash: t.hash,
    timestamp: Number(t.timeStamp) * 1000,
    isToken: false,
  }));
  for (const t of tokens.txs) {
    cands.push({
      to: t.to,
      amount: parseEthValue(t.value, t.tokenDecimal ?? "18"),
      txHash: t.hash,
      timestamp: Number(t.timeStamp) * 1000,
      isToken: true,
    });
  }
  // aggregate repeated destinations (exchange deposits arrive in many txs)
  const agg = new Map<string, Candidate>();
  for (const c of cands) {
    const prev = agg.get(c.to.toLowerCase());
    if (!prev || c.amount > prev.amount) agg.set(c.to.toLowerCase(), c);
  }
  return {
    cands: [...agg.values()].sort((a, b) => b.amount - a.amount).slice(0, 3),
    ok: true,
    note: "",
  };
}

async function btcCandidates(address: string) {
  const r = await getBtcOutgoing(address);
  if (!r.ok) return { cands: [] as Candidate[], ok: false, note: "blockchain.info failed" };
  const agg = new Map<string, Candidate>();
  for (const t of r.txs) {
    const prev = agg.get(t.to.toLowerCase());
    if (!prev || t.value > prev.amount)
      agg.set(t.to.toLowerCase(), {
        to: t.to,
        amount: t.value,
        txHash: t.txHash,
        timestamp: t.timestamp,
        isToken: false,
      });
  }
  return {
    cands: [...agg.values()].sort((a, b) => b.amount - a.amount).slice(0, 3),
    ok: true,
    note: "",
  };
}

async function tronCandidates(address: string) {
  const r = await getTrc20Outgoing(address);
  if (!r.ok) return { cands: [] as Candidate[], ok: false, note: "tronscan failed" };
  const agg = new Map<string, Candidate>();
  for (const t of r.txs) {
    const prev = agg.get(t.to_address.toLowerCase());
    if (!prev || t.block_ts > prev.timestamp)
      agg.set(t.to_address.toLowerCase(), {
        to: t.to_address,
        amount: parseTronValue(t.quant, t.tokenInfo?.decimals ?? 6),
        txHash: t.transactionHash,
        timestamp: t.block_ts,
        isToken: true,
      });
  }
  return {
    cands: [...agg.values()].sort((a, b) => b.amount - a.amount).slice(0, 3),
    ok: true,
    note: "",
  };
}

export async function traceAddress(
  address: string,
  chain: ChainId,
  maxHops = 4
): Promise<TraverseOutcome> {
  const hops: TraverseHop[] = [];
  const visited = new Set<string>([address.toLowerCase()]);
  const probes: string[] = [];
  let lastNote = "";
  let current = address;
  let stoppedOn: TraverseOutcome["stoppedOn"] = "max-depth";
  let exchangeName: string | undefined;

  for (let i = 0; i < maxHops; i++) {
    let r: Awaited<ReturnType<typeof evmCandidates>>;
    let via = "blockscout";
    if (chain === "eth" || chain === "bsc") {
      via = chain === "eth" ? "blockscout" : "etherscan-v2";
      r = await evmCandidates(chain, current);
      if (!r.ok && (chain === "eth" || hasEtherscanKey())) {
        via = "etherscan-v2";
        r = await evmCandidates(chain, current);
      }
    } else if (chain === "btc") {
      via = "blockchain.info";
      r = await btcCandidates(current);
    } else {
      via = "tronscan";
      r = await tronCandidates(current);
    }

    if (!r.ok) {
      lastNote = r.note;
      if (hops.length === 0) {
        return {
          hops: [],
          source: "live",
          probes: [...new Set(probes)],
          stoppedOn: "no-data",
          note: r.note,
        };
      }
      probes.push(via);
      stoppedOn = "dead-end";
      break;
    }
    probes.push(r.cands.length ? via : via);
    if (r.cands.length === 0) {
      stoppedOn = "dead-end";
      break;
    }

    // prefer a candidate that is a known exchange deposit (dataset match),
    // then any candidate not already visited
    const fresh = r.cands.filter((c) => !visited.has(c.to.toLowerCase()));
    const hit =
      r.cands.find((c) => matchExchange(c.to, chain) !== null) ??
      (fresh.length ? fresh[0] : r.cands[0]);

    const ex = matchExchange(hit.to, chain);
    hops.push({
      from: current,
      to: hit.to,
      amount: hit.amount,
      chain: chain.toUpperCase(),
      txHash: hit.txHash,
      timestamp: hit.timestamp,
      hopNumber: i + 1,
    });

    if (ex) {
      exchangeName = ex.name;
      stoppedOn = "exchange";
      break;
    }

    if (visited.has(hit.to.toLowerCase())) {
      stoppedOn = "dead-end";
      break;
    }
    visited.add(hit.to.toLowerCase());
    current = hit.to;
    await new Promise((res) => setTimeout(res, 300));
  }

  return {
    hops,
    source: "live",
    probes: [...new Set(probes)],
    stoppedOn,
    exchangeName,
    note: lastNote,
  };
}
