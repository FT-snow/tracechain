# TraceChain — Full Technical Description

## 1. System Overview

TraceChain is a crypto-forensics platform for Indian cybercrime cells: officers submit a suspect wallet address, the platform traces fund flow across real blockchains, identifies the exchange holding the funds, and generates a court-ready report with a freeze-request letter.

Three access surfaces share one engine:
- **Web dashboard** (`/dashboard`, `/trace`, `/nft`, `/watch`, `/reports`, `/correlations`, `/heatmap`, `/terminal`, `/settings`) — session-gated
- **CLI** (`cli/tracechain.js`) — Bun/Node script, runs in any terminal over SSH
- **REST API** (`/api/trace`, `/api/nft`, `/api/report`) — for integrations (NCRP-style systems)

**Stack:** Next.js 16 (App Router, TypeScript, Turbopack), Tailwind v4, Framer Motion, three.js / react-three-fiber, Convex (auth + planned persistence), OpenRouter (gpt-oss-120b). Deployed on Vercel; Convex cloud deployment `courteous-goshawk-398`.

---

## 2. The Tracing Engine (`app/api/trace/route.ts`, `lib/chain/traverse.ts`)

### 2.1 Input validation & chain detection
POST body `{ address, chain? }`. Address regex determines chain: `0x` + 40 hex → ETH/BSC; `bc1`/`1`/`3` Base58/Bech32 → BTC; `T` + Base58 → TRON. Manual `chain` override accepted.

### 2.2 Live traversal (per chain)

**ETH / BSC** — Etherscan V2 API (`chainid=1` / `chainid=56`, one key covers both) and Blockscout public API (keyless, ETH primary):
- Pull last 100 confirmed native transactions + last 100 ERC-20 token transfers
- Filter to outgoing only (`from == address`)
- Parse amounts with per-token decimals (USDT=6, most tokens=18 — wrong decimals = 1000x value errors)
- Aggregate repeated destinations (exchange deposits arrive in many txs — take max), rank by value, keep top 3 candidates

**BTC** — blockchain.info `rawaddr` API, UTXO-aware:
- A transaction counts only if the address appears in an *input* (sender)
- Follow the outputs, aggregate per destination, drop self-transfers
- Retry x3 with 5s/8s backoff against IP throttling

**TRON** — Tronscan TRC-20 transfer API:
- Outgoing USDT transfers, value decoded with token decimals

### 2.3 Path logic
Greedy value-path DFS, depth ≤ 4:
1. Fetch candidates for current address
2. Prefer any candidate that exists in the exchange dataset → stop on match
3. Else follow the largest-value *unvisited* target (cycle protection via visited set)
4. Repeat until exchange hit, dead-end, or depth limit

### 2.4 Exchange matching (`lib/chain/exchange-labels/`)
Dataset of verified exchange wallets `{ address, chain, name, walletType: hot|cold|deposit }` (Binance, Coinbase, Kraken, WazirX, etc.). Exact lowercase address match per chain — not heuristics, so false positives ≈ 0. A match ends the trace with confidence 0.99.

### 2.5 Risk scoring
```
riskScore = clamp(15 + hops×10 + (exchange ? 35 : 12) + (mixer ? 18 : 0), 99)
```
Breakdown returned per-trace: hopCount, mixerContact, velocity, exchangeConfidence. Live mode uses real values; the UI explains each weight (Explainability Panel with weighted bars).

### 2.6 Sandbox fallback (deterministic)
If live fails (no key / throttle / dead address): a seeded xorshift PRNG is derived from `hash(address)` — same input always produces the same hops, amounts, timestamps, and tx hashes. The sandbox is honest: every response carries `source: "live" | "simulated"`, `probes` (which APIs were contacted), and `stoppedOn` (`exchange` | `dead-end` | `max-depth` | `no-data` | `simulated`). UI, CLI, and reports surface this label everywhere.

---

## 3. Report Generation (`app/api/report/route.ts`)

The trace payload is normalized defensively (missing fields → safe defaults, cannot crash) and compiled into two prompts:
1. **Investigation report** — executive summary, transaction timeline, risk assessment, exchange identification, recommended actions, disclaimer. Formal English, court-ready markdown.
2. **Freeze-request letter** — addressed to the matched exchange's compliance team with deposit address, confidence, total traced amount, tx hashes.

Sent to gpt-oss-120b via OpenRouter (`max_tokens 4096, temperature 0.3`). Diagnostics: missing key, rejected key (401), and model errors produce distinct human-readable messages. Payload errors degrade gracefully instead of 500ing.

---

## 4. NFT Engine (`app/api/nft/route.ts`, `lib/chain/blockscout.ts`)

Indexes ERC-721 + ERC-1155 transfer events per address: collection, symbol, contract, token ID, standard, from→to, tx hash, timestamp. Forensic layer: any NFT whose destination is in the exchange dataset is flagged with the exchange name — the rug-pull-liquidation / wash-trade cash-out signature. Returns summary (received/sent/flagged/collections) + up to 100 transfers.

---

## 5. Frontend Surfaces

### 5.1 Landing page (`/`)
Dark "Command Center Noir": pure `#000` base, Norse custom typeface (public/fonts, `@font-face`), Geist Mono for technical labels, 4px radii, zero gradients/glows/emoji/pills. Sections: Hero (one word + one line + CTAs), Live demo, FAQ, CTA, Footer. All motion is Framer Motion with `ease [0.22,1,0.36,1]`, GPU-only properties, `useReducedMotion` respected.

### 5.2 3D fund-flow graph (`components/graph/FundFlowGraph.tsx`)
react-three-fiber canvas. Layout: left-to-right spine, victim → hops → exchange receding into depth. Nodes: flat-shaded icosahedra (white=victim, gray=wallet, orange=mixer, red=exchange) with spinning wire rings on load-bearing nodes. Edges: `TubeGeometry` on quadratic bezier curves, revealed by progressive `setDrawRange`. Flow particles ride the bezier per edge. Environment: black fog (16→42), concentric reticle rings, neutral hemisphere + directional lights, slow auto-orbit with damping and clamped polar angles. Client-only (dynamic import, `ssr:false`), IntersectionObserver-free in the landing loop (mount on first tick, replay without unmount).

### 5.3 Trace page (`/trace`)
Input → `POST /api/trace` → hops revealed one-by-one (700ms stagger): risk card (score + label + mixer + confidence), exchange banner, transaction timeline (typed by role color), explainability panel (weighted bars), action row: Generate Report → `/reports?address=`, Enable Live Watch → `/watch?address=`, Copy Address. Accepts `?address=` for chained auto-trace. Shows `source: live · blockchain apis` vs `sandbox engine`.

### 5.4 NFT page (`/nft`)
Address input → summary tiles → transfer table with exchange flags in red.

### 5.5 Live Watch (`/watch`)
Register wallets (persisted localStorage, chain auto-detected). Polls `/api/trace` every 60s per wallet; per-wallet card shows risk score, source, hop count, last-checked time. Failure states surfaced ("check failed").

### 5.6 Reports (`/reports`)
Auto-generates from `?address=`. Calls trace → report, stores history, inline expandable markdown view.

### 5.7 Correlations (`/correlations`)
Case clusters: multiple victims converging on shared deposit wallets → strength-scored clusters with linked case IDs (the multi-victim = same-operator signal).

### 5.8 Heat Map (`/heatmap`)
Complaint volume by district, ranked grid, intensity via functional risk colors, share-of-total stats.

### 5.9 Terminal (`/terminal`)
Interactive shell in the browser (mono, black, `$` prompt): `trace`, `nft`, `report`, `status` (probes both engines live with latency), `clear`, `help`. Speaks to the same endpoints as the CLI.

### 5.10 Settings (`/settings`)
API base, poll interval, chain toggles (BTC/ETH/BSC/TRX) — localStorage, with CLI usage block.

---

## 6. CLI (`cli/tracechain.js`)

Stateless Bun/Node script. `trace|nft|report <address> [--json] [--chain]`. One request in, one response out — all compute server-side, works over SSH/weak links. Auto-loads `.env.local` (Bun), honors `TRACECHAIN_URL` + `TRACECHAIN_API_KEY`. Report command retries ×3 with backoff (survives slow LLM calls). Table output for humans, JSON for machines. Exposed as `bun run cli` from the project root.

---

## 7. Authentication & Security

- **Web:** Convex Auth (`@convex-dev/auth`, Password provider) on cloud deployment `courteous-goshawk-398` — email/password accounts, RS256-signed session JWTs (keys live only in Convex env), persistent client sessions, gated dashboard layout with redirect, sign-out button.
- **API:** `x-api-key` gate (`TRACECHAIN_API_KEY` env) on all three endpoints; browser sends `NEXT_PUBLIC_TRACECHAIN_API_KEY` automatically; CLI reads env. Off entirely if the server var is unset.
- **Secrets:** never committed (verified against full git history); env-side only, both platforms.
- **Posture:** reactive-only tracing (victim-reported addresses), full request/response provenance, officer owns the judgment call.

---

## 8. Data Layer

- **Convex schema** (`convex/schema.ts`): wallets, traces (hops, exchangeMatch, riskBreakdown), reports (pdfUrl, freezeLetter, sha256 chain-of-custody), watches, alerts, cases, correlations, timelineEvents, advisoryFlags + authTables. `_generated` types produced by `convex dev --once`.
- **Client persistence:** watched wallets + poll results (localStorage), report history (state), settings (localStorage).

---

## 9. Deployment

- **Vercel:** production from GitHub `master`. Env: `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_TRACECHAIN_API_KEY`, `TRACECHAIN_API_KEY`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `ETHERSCAN_API_KEY`.
- **Convex:** functions pushed via `bunx convex dev --once`; JWT env (`JWT_PRIVATE_KEY`, `JWT_ISSUER`) set on deployment.
- **Verification harness:** gated 401s on all endpoints, live-trace smoke tests per chain, browser-bundle key match, Convex URL presence in chunks.
