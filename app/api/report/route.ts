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
  const key = (process.env.OPENROUTER_API_KEY ?? "").trim();
  if (!key || /^your/i.test(key)) {
    throw new Error(
      "MISSING KEY — OPENROUTER_API_KEY env var is not set on this deployment. Add it in Vercel → Settings → Environment Variables, then redeploy."
    );
  }
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://tracechain.dev",
      "X-Title": "TraceChain Report Generator",
    },
    body: JSON.stringify({
      model: MODEL,
      provider: { sort: "throughput" },
      messages: [
        {
          role: "system",
          content:
            "You are a law-enforcement report writer for Indian cybercrime cells. Write formal, clear, court-ready text in English. Use plain language suitable for a non-technical officer. Output structured markdown. Be concise.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 3200,
      temperature: 0.2,
    }),
  });
  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    if (res.status === 401)
      throw new Error(
        `OpenRouter 401 — key REJECTED. The OPENROUTER_API_KEY on this deployment is invalid/expired or malformed (quotes/spaces). Key present but invalid. Body: ${bodyText.slice(0, 120)}`
      );
    throw new Error(`OpenRouter ${res.status}: ${bodyText.slice(0, 120)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

export async function POST(req: Request) {
  if (!checkApiKey(req)) {
    return NextResponse.json({ error: "API key required — server has TRACECHAIN_API_KEY set but request sent no matching x-api-key header" }, { status: 401 });
  }
  try {
    const raw = await req.json();
    const input: TraceInput = {
      victimAddress: raw?.victimAddress ?? "unknown",
      hops: Array.isArray(raw?.hops) ? raw.hops : [],
      exchangeMatch: raw?.exchangeMatch ?? undefined,
      riskScore: typeof raw?.riskScore === "number" ? raw.riskScore : 0,
      riskBreakdown: {
        hopCount: raw?.riskBreakdown?.hopCount ?? (Array.isArray(raw?.hops) ? raw.hops.length : 0),
        mixerContact: Boolean(raw?.riskBreakdown?.mixerContact),
        velocity: raw?.riskBreakdown?.velocity ?? 0,
        exchangeConfidence: raw?.riskBreakdown?.exchangeConfidence ?? 0,
      },
    };

    const timeline = (input.hops ?? [])
      .map(
        (h) =>
          `Hop ${h?.hopNumber ?? "?"}: ${h?.from ?? "?"} → ${h?.to ?? "?"} | ${h?.amount ?? 0} ${String(h?.chain ?? "").toUpperCase()} | tx: ${h?.txHash ?? "?"} | ${new Date(h?.timestamp || Date.now()).toISOString()}`
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

Then add a final section:

---

# FREEZE REQUEST LETTER

Formal Indian law-enforcement letter to the compliance department of ${input.exchangeMatch?.name ?? "the identified exchange"} requesting immediate freeze of the deposit address ${input.exchangeMatch?.depositAddress ?? "N/A"} (funds-landing confidence ${input.exchangeMatch?.confidence ?? 0}%, total traced ${input.hops[input.hops.length - 1]?.amount ?? 0} ${String(input.hops[input.hops.length - 1]?.chain ?? "").toUpperCase()}). Include: case reference header, authority statement, freeze request, supporting details (addresses + tx hashes), legal basis, contact block.

Keep the whole output tight — no filler, no repetition. Format as clean markdown suitable for PDF conversion.`;

    const combined = await callLLM(reportPrompt);

    const sha256Input = JSON.stringify({ ...input, reportMd: combined, generatedAt: new Date().toISOString() });
    const hashBuffer = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(sha256Input)
    );
    const sha256Hash = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return NextResponse.json({
      report: combined,
      freezeLetter: "",
      sha256Hash,
      generatedAt: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
