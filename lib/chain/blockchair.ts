import { blockchairLimiter } from "./rate-limiter";

const BASE = "https://api.blockchair.com/bitcoin";

export interface BlockchairTx {
  hash: string;
  time: string;
  input_total: number;
  output_total: number;
  /* addresses involved */
  inputs: { address: string; value: number }[];
  outputs: { address: string; value: number }[];
}

export async function getBtcTransactions(
  address: string,
  limit = 25
): Promise<BlockchairTx[]> {
  await blockchairLimiter.acquire();
  const url = `${BASE}/dashboards/address/${address}?limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const txs = data?.data?.[address]?.transactions ?? [];
  return txs.map((t: Record<string, unknown>) => ({
    hash: t.hash as string,
    time: t.time as string,
    input_total: (t.input_total as number) ?? 0,
    output_total: (t.output_total as number) ?? 0,
    inputs: (t.inputs as { address: string; value: number }[]) ?? [],
    outputs: (t.outputs as { address: string; value: number }[]) ?? [],
  }));
}

export function parseBtcValue(satoshis: number): number {
  return satoshis / 1e8;
}
