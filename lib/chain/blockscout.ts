const ETH_BASE = "https://eth.blockscout.com";

interface BlockscoutTx {
  hash: string;
  timestamp: string;
  from: { hash: string };
  to: { hash: string | null };
  value: string;
  status: string;
}

interface BlockscoutTokenTransfer {
  transaction_hash: string;
  timestamp: string;
  from: { hash: string };
  to: { hash: string | null };
  total: { value: string };
  token: { decimals: string | number; symbol: string };
}

function parseTs(v: string | number): number {
  if (typeof v === "number") return v * 1000;
  const p = Date.parse(v);
  return Number.isNaN(p) ? 0 : p;
}

async function get(
  url: string,
  timeoutMs = 15000
): Promise<{ ok: boolean; json: { items?: unknown[] } | null }> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
    if (!res.ok) return { ok: false, json: null };
    return { ok: true, json: await res.json() };
  } catch {
    return { ok: false, json: null };
  }
}

export interface BlockscoutCandidate {
  to: string;
  amount: number;
  txHash: string;
  timestamp: number;
  isToken: boolean;
}

export async function getBlockscoutEthCandidates(
  address: string
): Promise<{ cands: BlockscoutCandidate[]; ok: boolean }> {
  const addr = address.toLowerCase();
  const [native, tokens] = await Promise.all([
    get(`${ETH_BASE}/api/v2/addresses/${address}/transactions`),
    get(`${ETH_BASE}/api/v2/addresses/${address}/token-transfers?type=ERC-20`),
  ]);
  if (!native.ok && !tokens.ok) return { cands: [], ok: false };

  const agg = new Map<string, BlockscoutCandidate>();

  for (const t of ((native.json?.items ?? []) as BlockscoutTx[])) {
    if (t.from?.hash?.toLowerCase() !== addr) continue;
    if (!t.to?.hash || t.to.hash.toLowerCase() === addr) continue;
    if (t.status && t.status !== "ok") continue;
    const amt = Number(t.value) / 1e18;
    const prev = agg.get(t.to.hash.toLowerCase());
    if (!prev || amt > prev.amount)
      agg.set(t.to.hash.toLowerCase(), {
        to: t.to.hash,
        amount: amt,
        txHash: t.hash,
        timestamp: parseTs(t.timestamp),
        isToken: false,
      });
  }

  for (const t of ((tokens.json?.items ?? []) as BlockscoutTokenTransfer[])) {
    if (t.from?.hash?.toLowerCase() !== addr) continue;
    if (!t.to?.hash || t.to.hash.toLowerCase() === addr) continue;
    const dec = Number(t.token?.decimals ?? 18) || 18;
    const amt = Number(t.total?.value ?? 0) / Math.pow(10, dec);
    const prev = agg.get(t.to.hash.toLowerCase());
    if (!prev || amt > prev.amount)
      agg.set(t.to.hash.toLowerCase(), {
        to: t.to.hash,
        amount: amt,
        txHash: t.transaction_hash,
        timestamp: parseTs(t.timestamp),
        isToken: true,
      });
  }

  return {
    cands: [...agg.values()].sort((a, b) => b.amount - a.amount),
    ok: true,
  };
}
