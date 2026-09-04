import { NextResponse } from "next/server";
import { checkApiKey } from "@/lib/auth";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const API_KEY = process.env.OPENROUTER_API_KEY ?? "";
const MODEL = process.env.OPENROUTER_MODEL ?? "openai/gpt-oss-120b";

interface Hop {
  from: string;
  to: string;
  amount: number;
  chain: string;
  txHash: string;
  timestamp: number;
  hopNumber: number;
}

interface TraceInput {
  victimAddress: string;
  hops: Hop[];
  exchangeMatch?: {
    name: string;
    depositAddress: string;
    confidence: number;
  };
  riskScore: number;
  riskBreakdown: {
    hopCount: number;
    mixerContact: boolean;
    velocity: number;
    exchangeConfidence: number;
  };
}

async function callLLM(prompt: string): Promise<string> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://tracechain.dev",
      "X-Title": "TraceChain Report Generator",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a law-enforcement report writer for Indian cybercrime cells. Write formal, clear, court-ready text in English. Use plain language suitable for a non-technical officer. Output structured markdown.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 4096,
      temperature: 0.3,
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function POST(req: Request) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const input: TraceInput = await req.json();

    const timeline = input.hops
      .map(
        (h) =>
          `Hop ${h.hopNumber}: ${h.from} → ${h.to} | ${h.amount} ${h.chain.toUpperCase()} | tx: ${h.txHash} | ${new Date(h.timestamp * 1000).toISOString()}`
      )
      .join("\n");

    const reportPrompt = `Generate a FORMAL INVESTIGATION REPORT for the following cryptocurrency fraud trace.

VICTIM WALLET ADDRESS: ${input.victimAddress}
RISK SCORE: ${input.riskScore}/100
MIXER CONTACT: ${input.riskBreakdown.mixerContact ? "YES" : "NO"}
TRANSFER VELOCITY: ${input.riskBreakdown.velocity}/100

TRANSACTION TIMELINE:
${timeline}

${input.exchangeMatch ? `EXCHANGE IDENTIFIED: ${input.exchangeMatch.name}\nDEPOSIT ADDRESS: ${input.exchangeMatch.depositAddress}\nCONFIDENCE: ${input.exchangeMatch.confidence}%` : "No exchange identified."}

Generate:
1. Executive Summary (2-3 paragraphs)
2. Transaction Timeline (formatted table)
3. Risk Assessment (paragraph)
4. Identified Exchange (paragraph)
5. Recommended Actions (numbered list)
6. Disclaimer

Format as clean markdown suitable for PDF conversion.`;

    const freezePrompt = `Generate a FORMAL FREEZE REQUEST LETTER addressed to the compliance department of ${input.exchangeMatch?.name ?? "the identified exchange"}.

This letter requests an immediate freeze on the following deposit address: ${input.exchangeMatch?.depositAddress ?? "N/A"}
Confidence of funds landing: ${input.exchangeMatch?.confidence ?? 0}%
Total traced amount: ${input.hops[input.hops.length - 1]?.amount ?? 0} ${input.hops[input.hops.length - 1]?.chain.toUpperCase() ?? ""}

Use formal Indian law-enforcement letter format. Include:
1. Case reference header
2. Authority statement
3. Request for immediate freeze
4. Supporting details (wallet addresses, transaction hashes)
5. Legal basis reference
6. Contact information

Format as clean markdown suitable for PDF conversion.`;

    const [reportMd, freezeMd] = await Promise.all([
      callLLM(reportPrompt),
      callLLM(freezePrompt),
    ]);

    const sha256Input = JSON.stringify({ ...input, reportMd, generatedAt: new Date().toISOString() });
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(sha256Input)
    );
    const sha256Hash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return NextResponse.json({
      report: reportMd,
      freezeLetter: freezeMd,
      sha256Hash,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
