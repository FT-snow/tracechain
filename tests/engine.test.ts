import { describe, test, expect } from "bun:test";
import { simulateTrace, seedFrom, rng } from "@/lib/chain/sandbox";
import { matchExchange } from "@/lib/chain/exchange-labels/matcher";
import { EXCHANGE_LABELS } from "@/lib/chain/exchange-labels/dataset";
import { parseEthValue } from "@/lib/chain/etherscan";
import { riskColor, riskLabel, shortenAddress } from "@/lib/utils";
import { post, get } from "./helpers/route-harness";

const BINANCE = "0x28C6c06298d514Db089934071355E5743bf21d60";

describe("sandbox determinism", () => {
  test("same address produces an identical trace, twice", () => {
    const a = simulateTrace(BINANCE, "ETH");
    const b = simulateTrace(BINANCE, "ETH");
    expect(a.hops).toEqual(b.hops);
    expect(a.riskScore).toEqual(b.riskScore);
    expect(a.exchangeMatch).toEqual(b.exchangeMatch);
  });

  test("different addresses produce different traces", () => {
    const a = simulateTrace(BINANCE, "ETH");
    const b = simulateTrace("0x8894E0a0c962CB723c1976a4421c95949bE2D4E3", "ETH");
    expect(JSON.stringify(a.hops)).not.toEqual(JSON.stringify(b.hops));
  });

  test("sandbox timestamps are pinned, not wall-clock", () => {
    const a = simulateTrace(BINANCE, "ETH");
    const b = simulateTrace(BINANCE, "ETH");
    expect(a.hops[0].timestamp).toEqual(b.hops[0].timestamp);
  });

  test("seeded rng is stable", () => {
    const r1 = rng(seedFrom("abc"));
    const r2 = rng(seedFrom("abc"));
    for (let i = 0; i < 10; i++) expect(r1()).toEqual(r2());
    expect(rng(seedFrom("abc"))()).not.toEqual(rng(seedFrom("xyz"))());
  });
});

describe("exchange matcher precision", () => {
  test("exact-match hits a dataset entry", () => {
    const eth = EXCHANGE_LABELS.find((e) => e.chain === "eth")!;
    const hit = matchExchange(eth.address, "eth");
    expect(hit?.name).toEqual(eth.name);
  });

  test("case-insensitive match", () => {
    const eth = EXCHANGE_LABELS.find((e) => e.chain === "eth")!;
    expect(matchExchange(eth.address.toUpperCase(), "eth")).not.toBeNull();
  });

  test("unknown address does not match", () => {
    expect(matchExchange("0x0000000000000000000000000000000000000001", "eth")).toBeNull();
  });

  test("wrong chain does not match", () => {
    const eth = EXCHANGE_LABELS.find((e) => e.chain === "eth")!;
    expect(matchExchange(eth.address, "btc")).toBeNull();
  });
});

describe("value decoding", () => {
  test("18-decimal ETH value", () => {
    expect(parseEthValue("1000000000000000000", "18")).toEqual(1);
  });
  test("6-decimal USDT value", () => {
    expect(parseEthValue("15000000", "6")).toEqual(15);
  });
  test("missing decimals defaults to 18", () => {
    expect(parseEthValue("1000000000000000000")).toEqual(1);
  });
});

describe("utils", () => {
  test("riskColor maps score bands", () => {
    expect(riskColor(10)).toEqual("var(--risk-low)");
    expect(riskColor(50)).toEqual("var(--risk-med)");
    expect(riskColor(95)).toEqual("var(--risk-hi)");
  });
  test("riskLabel bands", () => {
    expect(riskLabel(10)).toEqual("LOW");
    expect(riskLabel(95)).toEqual("HIGH");
  });
  test("shortenAddress produces ellipsis form", () => {
    expect(shortenAddress("0x1234567890abcdef1234567890abcdef12345678")).toMatch(/…/);
  });
});

describe("API surfaces (route handlers invoked directly)", () => {
  test("POST /api/trace with invalid address never crashes (400 or gated 401)", async () => {
    const res = await post("trace", { address: "nope" });
    const d = await res.json();
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
    expect(d?.error ?? "").toBeTruthy();
  });

  test("POST /api/report responds structured even on empty payload (payload defensibility)", async () => {
    const res = await post("report", {});
    const d = await res.json();
    // No matter the environment, the route must return structured JSON with
    // either a report or a clear error — never an unhandled crash.
    expect(typeof d === "object" && d !== null).toBe(true);
    expect(d.report !== undefined || d.error !== undefined).toBe(true);
  });

  test("GET /api/dataset returns bound registry when gated or clear 401", async () => {
    const res = await get("dataset");
    const d = await res.json();
    if (res.status === 401) {
      expect(d?.error ?? "").toMatch(/API key required/);
    } else {
      expect(res.status).toEqual(200);
      expect(d.count).toBeGreaterThan(0);
      expect(d.sha256).toMatch(/^[0-9a-f]{16}$/);
      expect(d.entries[0].name).toBeTruthy();
    }
  });
});
