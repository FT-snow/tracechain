import { NextResponse } from "next/server";
import { checkApiKey } from "@/lib/auth";
import { getNftTransfers, NftTransfer } from "@/lib/chain/blockscout";
import { EXCHANGE_LABELS } from "@/lib/chain/exchange-labels/dataset";

export async function POST(req: Request) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const address: string = (body.address ?? "").trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: "NFT tracing currently supports Ethereum addresses" },
        { status: 400 }
      );
    }

    const r = await getNftTransfers(address);
    if (!r.ok) {
      return NextResponse.json(
        { error: "NFT source unavailable (blockscout)" },
        { status: 502 }
      );
    }

    const ethSet = new Set(
      EXCHANGE_LABELS.filter((e) => e.chain === "eth").map((e) =>
        e.address.toLowerCase()
      )
    );

    const transfers = r.transfers.map((t: NftTransfer) => ({
      ...t,
      toExchange:
        ethSet.has(t.to.toLowerCase())
          ? EXCHANGE_LABELS.find(
              (e) => e.chain === "eth" && e.address.toLowerCase() === t.to.toLowerCase()
            )?.name ?? null
          : null,
    }));

    const received = transfers.filter(
      (t) => t.to.toLowerCase() === address.toLowerCase()
    ).length;
    const sent = transfers.filter(
      (t) => t.from.toLowerCase() === address.toLowerCase()
    ).length;
    const flagged = transfers.filter((t) => t.toExchange).length;
    const collections = [...new Set(transfers.map((t) => t.collection))];

    return NextResponse.json({
      address,
      source: "live",
      source_api: "blockscout",
      transfers,
      summary: { received, sent, flagged: flagged, collections: collections.length },
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
