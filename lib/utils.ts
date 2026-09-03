import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortenAddress(addr: string, leading = 6, trailing = 4) {
  if (!addr) return "";
  if (addr.length <= leading + trailing + 3) return addr;
  return `${addr.slice(0, leading)}…${addr.slice(-trailing)}`;
}

export function formatAmount(amount: number, chain: string) {
  const symbol =
    chain === "btc" ? "BTC" : chain === "tron" ? "TRX" : "ETH";
  const usd = chain === "tron" ? amount * 0.12 : chain === "btc" ? amount * 58000 : amount * 3200;
  return {
    token: `${amount.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${symbol}`,
    usd: `$${usd.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
  };
}

export function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function riskColor(score: number) {
  if (score >= 70) return "var(--risk-hi)";
  if (score >= 40) return "var(--risk-med)";
  return "var(--risk-low)";
}

export function riskLabel(score: number) {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
}
