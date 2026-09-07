# TraceChain

Real-time identification of fraud-linked cryptocurrency exchanges from victim-reported wallet addresses — through automated blockchain analytics. Built for SIH26183, Ministry of Home Affairs.

Submit a suspect wallet. Trace the money across Bitcoin, Ethereum, BSC, and Tron, hop by hop, live on real chains. When funds land on a known exchange deposit wallet, name it, score the risk, and generate a court-ready report with a freeze-request letter — in under a minute.

Every transaction in the output is independently verifiable on a public ledger. The evidence does not need this tool to exist.

## Contents

- [Overview](#overview)
- [Features](#features)
- [How the tracing engine works](#how-the-tracing-engine-works)
- [NFT tracing](#nft-tracing)
- [Reports](#reports)
- [Three access surfaces](#three-access-surfaces)
- [Quickstart](#quickstart)
- [CLI](#cli)
- [Environment variables](#environment-variables)
- [Deployment](#deployment)
- [Security model](#security-model)
- [Court admissibility](#court-admissibility)
- [Repository documentation](#repository-documentation)

## Overview

Existing crypto-forensics suites (Chainalysis, Elliptic) cost lakhs per seat per year and require trained analysts — so they serve central agencies, not the district officer who actually receives the complaint. TraceChain is the last mile: self-serve, near-zero operational cost on free-tier chain APIs, zero blockchain training required, and every output designed for evidentiary use.

The system is deliberately honest about its data: every response carries its provenance (`live` versus `simulated`), the exact APIs contacted, and why a trace stopped. The product cannot overstate what it knows.

## Features

- Live multi-chain fund-flow tracing (ETH, BSC, BTC, TRX / USDT-TRC20)
- Exchange deposit identification against a verified wallet dataset (hot, cold, deposit classes)
- Risk scoring with a fully explainable breakdown (hop depth, mixer contact, velocity, exchange confidence)
- Auto-generated court-ready investigation reports and freeze-request letters
- Deterministic sandbox fallback so the interface never fails to produce a trace
- NFT tracing: ERC-721 and ERC-1155 history with exchange cash-out flags
- Live Watch: continuous 60-second polling of registered wallets
- 3D fund-flow graph shared by the landing demo and live traces
- Session-gated officer dashboard (Convex Auth), key-gated REST API, CLI, and browser terminal
- Chainable workflows: Trace to Report to Live Watch in one continuous path

## How the tracing engine works

The chain is detected from the address format, then live traversal begins:

- **ETH / BSC** — confirmed native transactions and ERC-20 token transfers are aggregated by destination and ranked by value. Values are decoded per-token-decimal (USDT 6, default 18).
- **BTC** — UTXO-aware: a transaction counts only if the address appears as an input (a genuine sender), then the outputs are followed.
- **TRON** — outgoing USDT TRC-20 transfers, the dominant rail for scam proceeds in India.

At every hop, the destination is matched against the verified exchange dataset (`lib/chain/exchange-labels/`) by exact address — no heuristics, near-zero false positives. A match ends the trace and names the exchange. Otherwise the largest-value unvisited target is followed, up to four hops.

If an API throttles, a key is missing, or the chain is dead-ended, a deterministic sandbox engine takes over — seeded by an address hash so identical input yields identical output — and the response is labeled `simulated` with the stop reason. Nothing in the product can overstate its data source: `source: live | simulated`, the API probes used, and the stop reason travel with every response, in the UI, the CLI, and the report.

## NFT tracing

ERC-721 and ERC-1155 transfer events are indexed per address — collection, token id, from, to, transaction hash, timestamp. Any NFT landing on a known exchange wallet is flagged with the exchange name: the signature of a rug-pull liquidation or wash-trade cash-out.

## Reports

The trace payload feeds gpt-oss-120b via OpenRouter and returns, in a single generation, a formal investigation report (executive summary, transaction timeline, risk assessment, exchange identification, recommended actions, disclaimer) followed by a formal freeze-request letter addressed to the matched exchange. The payload is normalized defensively — malformed input degrades to a partial report rather than failing.

## Three access surfaces

1. **Web dashboard** — session-gated officer interface with chained flows: Quick Trace auto-runs `/trace?address=`, Generate Report auto-runs `/reports?address=`, Enable Live Watch auto-registers `/watch?address=`.
2. **Terminal** — interactive browser shell at `/terminal` (`status`, `trace`, `nft`, `report`).
3. **REST API** — `POST /api/trace`, `POST /api/nft`, `POST /api/report`, JSON in and out, secured by an API key.

All three speak to the same engine and the same honesty contract.

## Quickstart

```bash
cd tracechain
bun install
bun dev
# open http://localhost:3000
```

Create an account at `/login` (email + password, min 8 characters). Convex Auth handles sessions; the `convex/` functions were pushed with `bunx convex dev --once`.

## CLI

The CLI works from the project root and defaults to the local engine; point `TRACECHAIN_URL` at any deployment.

```bash
bun run cli trace 0x28C6c06298d514Db089934071355E5743bf21d60
bun run cli nft 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
bun run cli report 0x28C6c06298d514Db089934071355E5743bf21d60 > report.md
```

The CLI is stateless — one request in, one response out, retries on slow LLM calls, and runs over SSH on weak connections. Table output for humans, `--json` for machines.

## Environment variables

```env
NEXT_PUBLIC_CONVEX_URL=https://<deployment>.convex.cloud
NEXT_PUBLIC_TRACECHAIN_API_KEY=<same value as TRACECHAIN_API_KEY>
TRACECHAIN_API_KEY=<random hex — gates /api/trace, /api/nft, /api/report>
OPENROUTER_API_KEY=<sk-or-v1-...>
OPENROUTER_MODEL=openai/gpt-oss-120b
ETHERSCAN_API_KEY=<free key — enables live BSC via Etherscan V2>
```

Optional: `ETHERSCAN_API_KEY` covers ETH and BSC on the V2 API; ETH also runs keyless via Blockscout. BTC and TRON sources are keyless. Convex-side (`JWT_PRIVATE_KEY`, `JWT_ISSUER`, `CONVEX_SITE_URL`) lives only on the Convex deployment, never in this repo.

## Deployment

- **Vercel** — production builds from GitHub `master`.
- **Convex** — functions pushed with `bunx convex dev --once` after schema changes.

## Security model

- Session-gated UI (Convex Auth, RS256-signed JWTs; keys live only in Convex env)
- Key-gated API with clear 401 diagnostics
- Secrets never committed (verified across full git history)
- Reactive-only tracing — victim-reported addresses; authenticated access creates a full audit trail; every response discloses its provenance

## Court admissibility

The report is built for the Bharatiya Sakshya Adhiniyam, 2023 certification workflow (formerly s.65B): the SHA-256 digest binds content at creation, provenance metadata records how each fact was obtained, exchange matches cite published dataset entries rather than heuristics, and every hop re-verifies against the public ledger. The tool shows where money went; the officer, under oath, connects it to the case. See [LEGAL.md](./LEGAL.md).

## Repository documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — full technical description of every subsystem
- [DEMO.md](./DEMO.md) — demo runbook: WSL commands, verified addresses, competitive analysis
- [FEATURES.md](./FEATURES.md) — feature changelog
- [LEGAL.md](./LEGAL.md) — court admissibility overview

Built for SIH26183 — Ministry of Home Affairs.
