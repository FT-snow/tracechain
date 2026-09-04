import { etherscanLimiter } from "./rate-limiter";

const API = "https://api.etherscan.io/v2/api";
const KEY = process.env.ETHERSCAN_API_KEY ?? "";

export const hasEtherscanKey = () =>
  KEY.length > 0 && !/^your/i.test(KEY);

export interface EtherscanTx {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  tokenDecimal?: string;
  tokenSymbol?: string;
}

export interface EtherscanResult<T> {
  txs: T[];
  ok: boolean;
  message?: string;
}

async function callModule(
  chainid: number,
  params: string
): Promise<EtherscanResult<EtherscanTx>> {
  await etherscanLimiter.acquire();
  const url = `${API}?chainid=${chainid}&${params}&apikey=${KEY}`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    const data = await res.json();
    if (data.status !== "1" || !Array.isArray(data.result)) {
      if (data.message === "No transactions found") return { txs: [], ok: true };
      return {
        txs: [],
        ok: false,
        message: data.result ?? data.message ?? `status ${data.status}`,
      };
    }
    return { txs: data.result, ok: true };
  } catch (e) {
    return { txs: [], ok: false, message: e instanceof Error ? e.message : "fetch failed" };
  }
}

async function outgoingFor(
  chainid: number,
  address: string
): Promise<EtherscanResult<EtherscanTx>> {
  const addr = address.toLowerCase();
  const r = await callModule(
    chainid,
    `module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc`
  );
  if (!r.ok) return r;
  return {
    ok: true,
    txs: r.txs.filter(
      (t) => t.from.toLowerCase() === addr && t.to && t.to.toLowerCase() !== addr
    ),
  };
}

async function tokensFor(
  chainid: number,
  address: string
): Promise<EtherscanResult<EtherscanTx>> {
  const addr = address.toLowerCase();
  const r = await callModule(
    chainid,
    `module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=100&sort=desc`
  );
  if (!r.ok) return r;
  return {
    ok: true,
    txs: r.txs.filter(
      (t) => t.from.toLowerCase() === addr && t.to && t.to.toLowerCase() !== addr
    ),
  };
}

export async function getEthOutgoing(address: string) {
  return outgoingFor(1, address);
}

export async function getEthTokenTransfers(address: string) {
  return tokensFor(1, address);
}

export async function getBscOutgoing(address: string) {
  return outgoingFor(56, address);
}

export async function getBscTokenTransfers(address: string) {
  return tokensFor(56, address);
}

export function parseEthValue(wei: string, decimals = "18"): number {
  const d = Number(decimals) || 18;
  return Number(wei) / Math.pow(10, d);
}
