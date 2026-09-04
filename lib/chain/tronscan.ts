import { tronscanLimiter } from "./rate-limiter";

const API = "https://api.tronscan.org";

export interface Trc20Transfer {
  transactionHash: string;
  block_ts: number;
  from_address: string;
  to_address: string;
  quant: string;
  tokenInfo: { symbol: string; decimals: number };
}

export async function getTrc20Outgoing(
  address: string
): Promise<{ txs: Trc20Transfer[]; ok: boolean }> {
  await tronscanLimiter.acquire();
  const addr = address.toLowerCase();
  const url = `${API}/api/transfer/trc20?relatedAddress=${address}&limit=50&direction=out&start=0`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return { txs: [], ok: false };
    const data = await res.json();
    const rows: Trc20Transfer[] = data?.transferList ?? data?.data ?? [];
    return {
      ok: true,
      txs: rows.filter(
        (t) =>
          t.from_address?.toLowerCase() === addr &&
          t.to_address &&
          t.to_address.toLowerCase() !== addr
      ),
    };
  } catch {
    return { txs: [], ok: false };
  }
}

export function parseTronValue(quant: string, decimals = 6): number {
  return Number(quant) / Math.pow(10, decimals);
}
