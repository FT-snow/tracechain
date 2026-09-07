# TraceChain — Feature Changelog

## Core Engine (real chain access)
- **Live blockchain traversal** — BFS/greedy value-path tracing across ETH (Blockscout, keyless), BSC (Etherscan V2), BTC (blockchain.info, UTXO-aware), TRON (Tronscan TRC-20). Real transaction hashes on every hop, verifiable on public explorers.
- **Deterministic sandbox fallback** — same-address-same-result simulated engine when APIs throttle or keys are absent. Every response is honestly labeled `live` or `simulated` with probe list and stop reason.
- **Exchange deposit matching** — curated dataset of known exchange wallets (hot/cold/deposit); exact-match identification with confidence scoring.
- **Risk scoring with explainability** — hop depth, mixer contact, velocity, exchange confidence, each weighted and shown per trace.
- **Rate limiting** — per-provider request pacing so free-tier limits are respected honestly.

## NFT tracing
- **ERC-721 / ERC-1155 transfer engine** — full NFT movement history per address: collection, token ID, standard, from→to, tx hash, timestamp.
- **Cash-out flags** — NFTs landing on known exchange wallets are flagged (rug/wash-trading pattern).

## Reports
- **Auto-generated court-ready reports** — live trace payload → gpt-oss-120b (OpenRouter) → formal investigation report with transaction timeline, risk analysis, freeze-request framing.
- **Report history + inline viewing** on `/reports`.

## Interfaces
- **Landing page** — dark noir minimal design, custom Norse typography, Spline 3D hero, looping 3D fund-flow demo.
- **Officer dashboard** — trace, live watch, reports, correlations, heatmap, settings; Convex Auth session-gated.
- **3D fund-flow graph** — curved tube edges with progressive draw, flat-shaded nodes, depth fog, auto-orbit; shared by demo loop and live traces.
- **Live Watch** — 60s polling of registered wallets with per-wallet risk, source tag, last-checked status.
- **Browser terminal** — WSL-mirrored shell (`trace`, `nft`, `report`, `status`, `help`) speaking to the same engine.
- **CLI** — `bun cli/tracechain.js trace|nft|report` — works locally or against any deployment; table + JSON output.

## Platform
- **Convex Auth sessions** — email/password, persistent sessions, gated dashboard, sign-out.
- **API key gating** — `x-api-key` on all REST endpoints; browser and CLI flows wired; clear 401 diagnostics.
- **Flow chaining** — Quick Trace → auto-trace → Generate Report → Enable Live Watch, all wired via URL params.
- **Truth surfacing** — source tags (live/simulated), probe lists, stop reasons visible in UI, CLI, and API.
