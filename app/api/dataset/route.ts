import { NextResponse } from "next/server";
import { checkApiKey } from "@/lib/auth";
import { EXCHANGE_LABELS } from "@/lib/chain/exchange-labels/dataset";

export async function GET(req: Request) {
  if (!checkApiKey(req)) {
    return NextResponse.json(
      { error: "API key required — server has TRACECHAIN_API_KEY set but request sent no matching x-api-key header" },
      { status: 401 }
    );
  }

  const datasetJson = JSON.stringify(EXCHANGE_LABELS);
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(datasetJson)
  );
  const sha256 = Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 16);

  return NextResponse.json({
    version: 1,
    sha256,
    count: EXCHANGE_LABELS.length,
    chains: [...new Set(EXCHANGE_LABELS.map((e) => e.chain))],
    entries: EXCHANGE_LABELS.map((e) => ({
      address: e.address,
      chain: e.chain,
      name: e.name,
      walletType: e.walletType,
    })),
  });
}
