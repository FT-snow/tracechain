import { etherscanLimiter } from "./rate-limiter";

const API = "https://api.etherscan.io/api";
const KEY = process.env.ETHERSCAN_API_KEY ?? "";

export interface EtherscanTx {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
}

export async function getEthTransactions(
  address: string,
  startBlock = 0,
  endBlock = 99999999
): Promise<EtherscanTx[]> {
  await etherscanLimiter.acquire();
  const url = `${API}?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&sort=desc&apikey=${KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "1" || !data.result) return [];
  return data.result.filter(
    (tx: EtherscanTx) =>
      tx.from.toLowerCase() !== address.toLowerCase() ||
      tx.to.toLowerCase() !== address.toLowerCase()
  );
}

export async function getBscTransactions(
  address: string,
  startBlock = 0,
  endBlock = 99999999
): Promise<EtherscanTx[]> {
  await etherscanLimiter.acquire();
  const url = `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=${startBlock}&endblock=${endBlock}&sort=desc&apikey=${KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== "1" || !data.result) return [];
  return data.result;
}

export function parseEthValue(wei: string): number {
  return Number(wei) / 1e18;
}
