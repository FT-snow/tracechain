import { tronscanLimiter } from "./rate-limiter";

const API = "https://api.tronscan.org";

export interface TronTx {
  txID: string;
  raw_data: {
    contract: {
      parameter: {
        value: {
          amount: number;
          owner_address: string;
          to_address: string;
        };
      };
    }[];
    timestamp: number;
  };
}

export async function getTronTransactions(
  address: string,
  limit = 25
): Promise<TronTx[]> {
  await tronscanLimiter.acquire();
  const url = `${API}/transaction?limit=${limit}&sort=-timestamp&relatedAddress=${address}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data?.data ?? [];
}

export function parseTronValue(bands: number): number {
  return bands / 1e6;
}
