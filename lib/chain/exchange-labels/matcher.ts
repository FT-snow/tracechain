import { EXCHANGE_LABELS, ExchangeLabel } from "./dataset";

export function matchExchange(
  address: string,
  chain: string
): ExchangeLabel | null {
  const addr = address.toLowerCase();
  return (
    EXCHANGE_LABELS.find(
      (e) => e.address.toLowerCase() === addr && e.chain === chain
    ) ?? null
  );
}

export function getExchangeNames(): string[] {
  return [...new Set(EXCHANGE_LABELS.map((e) => e.name))];
}
