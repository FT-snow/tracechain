const API = "https://blockchain.info";

export interface BtcSpend {
  txHash: string;
  to: string;
  value: number;
  timestamp: number;
}

export async function getBtcOutgoing(
  address: string
): Promise<{ txs: BtcSpend[]; ok: boolean }> {
  let r = await attempt(address);
  if (!r.ok) {
    await new Promise((res) => setTimeout(res, 5000));
    r = await attempt(address);
  }
  if (!r.ok) {
    await new Promise((res) => setTimeout(res, 8000));
    r = await attempt(address);
  }
  return r;
}

async function attempt(address: string): Promise<{ txs: BtcSpend[]; ok: boolean }> {
  const url = `${API}/rawaddr/${address}?limit=50&cors=true`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!res.ok) return { txs: [], ok: false };
    const data = await res.json();
    const txs = data?.txs ?? [];
    const spends: BtcSpend[] = [];
    for (const tx of txs) {
      const isSender = (tx.inputs ?? []).some(
        (i: { prev_out?: { addr?: string } }) =>
          i.prev_out?.addr?.toLowerCase() === address.toLowerCase()
      );
      if (!isSender) continue;
      for (const out of tx.out ?? []) {
        if (!out.addr || out.addr.toLowerCase() === address.toLowerCase()) continue;
        spends.push({
          txHash: tx.hash,
          to: out.addr,
          value: out.value / 1e8,
          timestamp: Number(tx.time) * 1000,
        });
      }
    }
    return { txs: spends, ok: true };
  } catch {
    return { txs: [], ok: false };
  }
}
