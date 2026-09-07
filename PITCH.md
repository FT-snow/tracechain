# TraceChain — Final Presentation Master Document
*Everything: addresses, terminals, features, Q&A, and the minute-by-minute script.*

---

## 1. Wallet addresses (verified lanes for the demo)

### Ethereum (LIVE — real hops, verifiable on etherscan.io)
```
0x28C6c06298d514Db089934071355E5743bf21d60   Binance hot — deepest chain
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045   vitalik.eth
1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ           BitMEX cold (BTC)
```

### NFT
```
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045   100 transfers · 31 collections
```

## 2. Terminal commands — online (production) and offline (local)

### OFFLINE — WSL, local engine
```bash
cd /home/prakhar_upadhyay/projects/tracechain
bun dev            # terminal 1 — engine on http://localhost:3000

# terminal 2 — CLI (bun auto-loads .env.local; no exports needed)
bun run cli trace 0x28C6c06298d514Db089934071355E5743bf21d60
bun run cli nft   0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045
bun run cli report 0x28C6c06298d514Db089934071355E5743bf21d60 > report.md
```

### ONLINE — production engine (works from ANY machine, incl. other WSL boxes)
```bash
export TRACECHAIN_URL=https://tracechain-flax.vercel.app
export TRACECHAIN_API_KEY=df56a9712d6494b050c57140b675df6fbe1c091d80ff93e9
bun run cli trace  0x28C6c06298d514Db089934071355E5743bf21d60
bun run cli report 0x28C6c06298d514Db089934071355E5743bf21d60 > report.md
```

### Browser terminal (no install)
`https://tracechain-flax.vercel.app/terminal` → `status` → `trace …` → `report …`

**Kill-shot move:** after any trace, open `https://etherscan.io/tx/<hop txHash>` live — the transaction exists on the public ledger. Engine output = ledger output.

---

## 3. Every feature (one line each)

| Surface | What it does |
|---|---|
| Landing | Noir B&W CRT plasma below the fold, Spline 3D hero, one-word headings, Lastik type |
| `/trace` | Live chain traversal (ETH/BSC keyless Blockscout + Etherscan V2, BTC UTXO-aware, TRON USDT), exchange deposit matching, explainable risk, honest `live/simulated` labels |
| `/nft` | ERC-721/1155 history + exchange cash-out flags |
| `/watch` | 60s polling, per-wallet risk/source/last-checked |
| `/reports` | gpt-oss report + freeze letter, SHA-256 content hash + hash-chain, Re-verify (REPRODUCED/CHANGED), Export PDF |
| `/provenance` | Full exchange dataset registry with integrity SHA — the receipts |
| Heat Map | Severity-ranked complaint volume + correlations merged in (cluster money-graphs) |
| `/terminal` | Browser shell mirroring the WSL CLI |
| CLI | Stateless; one request in, one response out; runs over weak SSH links |
| API | Key-gated (`x-api-key`), NCRP-ready |
| Auth | Convex Auth sessions, gated dashboard, sign-out |
| Honesty | `source` label + probes + stop reason on every response; sandbox never counterfeits live |

---

## 4. Where to surface THE report (where to point when asked)

1. **Tests & CI** — `/tests/engine.test.ts`, 17/17, GitHub Actions badge → "engine behavior is machine-verified on every commit."
2. **`ARCHITECTURE.md`** — full subsystem mechanics.
3. **`docs/tracechain-dossier.tex` → compiled PDF** — the judge dossier: risk equation, re-verification math (`H' = H` → REPRODUCED), hash-chain `H_i = SHA256(payload ∥ H_{i−1})`, legal design, benchmarks, competitive matrix.
4. **`LEGAL.md`** — BSA 2023 **Section 63** (formerly s.65B IEA) certification workflow; the report slots into the officer's attestation.
5. **Live page evidence** — `/provenance` receipts; `/reports` → Re-verify → `REPRODUCED`; Export PDF → stamp on first page.
6. **`DEMO.md`** — runbook + benchmark table + competitive matrix.

---

## 5. What you'll be questioned on — and the one-line answer

| Question | Answer (memorize closers) |
|---|---|
| Is it real or mock? | "Live first — flip any hop hash open on Etherscan. Sandbox is deterministic fallback, always labeled." |
| False positives? | "Exact-address dataset match — zero heuristics. `/provenance` shows the receipts." |
| Mixer? | "Flagged and scored, not cracked. Where 80% of recoverable funds sit is before/after." |
| Wrongful freeze? | "Tool drafts; officer signs. Warrant gate. Report states limits itself." |
| Tampering? | "SHA-256 at creation + hash-chain: edit one char, every descendant digest breaks." |
| Legal? | "BSA 2023 Section 63 certification workflow — built for it, not bolted on." |
| Rate limits/scale? | "Adapter architecture — providers swap by config." |
| Weekend hack? | "17 property tests + CI, full TS. Attack any file." |

---

## 4×5-minute PPT script (10:00 total)

**Anchal — Slide 1 (0:00–0:22)**
> "Good morning. SIH problem statement 26183 — fraud-linked exchange identification — theme Blockchain & Cybersecurity, software category. Team Sudo rm –rf/, six members, one engine."

**Anchal — Slide 2 (0:22–2:00)**
> "TraceChain takes one wallet address through four steps: ingest with automatic chain detection, trace a bounded BFS capping at five hops and 500 transactions under fifteen seconds, resolve against FIU-IND exchange pools with a zero-to-one-hundred risk score, and act — hashed freeze notices plus live watch. Here is the before/after: enterprise suites cost lakhs per seat and need a forensic analyst; TraceChain runs on free-tier APIs, any constable with zero blockchain training, verdict in about a minute, at every district cell — because crypto's anonymity ends the moment stolen funds need to become spendable, we trace to exactly that point. Five differentiators: works on low network, live tracking, explainable risk, automated multi-hop tracing, and actionable evidence — real PDFs, real freeze letters."
> (~95 words @150wpm → fits)

**Pratyush — Slide 3 (2:00–3:00)**
> "The stack: Next.js with TypeScript and Tailwind on the front, Framer Motion and Three Fiber for the graph; Convex with Bun and Vercel on the back; Blockscout, Etherscan V2, blockchain.info and Tronscan as our chain adapters; SHA-256 chain-of-custody, TLS, and Convex Auth for security. Execution is a five-stage flow — adapter routing chooses the right chain API, graph traversal follows the money hop by hop, intelligence enriches with dataset matching and risk scoring, evidence generation produces the hashed report and freeze letter, and live watch keeps polling. One flow, one engine, three doors — browser, terminal, API."
> (~93 words)

**Aryan — Slide 4 (3:00–4:00)**
> "Feasibility first: traversal completes in seconds, cost stays near zero, four networks covered, and the triage is single-click for a non-specialist. Now the four challenges we've pre-mitigated. Wrongful freeze — we never auto-freeze; the tool drafts, and freezing requires an officer's signed authority. False accusation — we surface leads, not proof; identity attribution demands exchange KYC via legal process. API quotas — bounded depth, destination aggregation, and deterministic caching keep us inside free-tier limits. Tampering — every artifact is SHA-256 hashed at creation and chained. We designed around misuse first, capability second."
> (~88 words)

**Arush — Slide 5 (4:00–5:00)**
> "Four outcomes. One: complaint-to-verdict collapses from days to under a minute, which is the difference between freezing funds and reading about them leaving. Two: explainable scoring makes the investigation defensible — the panel shows why the score is what it is. Three: it empowers under-resourced district teams at zero per-seat cost. Four, and I think the quietest big one: network-level intelligence — four victims filing separately converge on the same deposit wallet, and that pattern surfaces the scam *ring*, not just four unrelated cases. Every artifact — report, freeze letter — carries a SHA-256 digest, Section 63 BSA-ready."
> (~94 words)

**Aishwarya — Slide 6 (5:00→ handoff — leave audience mid-breath)**
> "Everything we claim stands on public research: graph traversal per Tarhan seventy-two, exchange heuristics benchmarked against TRM and Chainanalysis methods, FATF guidance on virtual assets, Section sixty-three of the Sakshya Adhiniyam for electronic evidence, and Nakamoto's whitepaper plus Mikeljohn's 'Fistful of Bitcoins' for ledger analysis fundamentals. Repo and live prototype are on the slide. Now — instead of more slides, let me hand to Prakhar: he will trace a real wallet on the real blockchain and verify a hash in front of you."
> (~80 words)

**Prakhar — Demo (5:00–10:00)**
1. `status` in the browser terminal — engines live.
2. `trace 0x28C6c06298d514Db089934071355E5743bf21d60` — live hops build in 3D.
3. Open `etherscan.io/tx/<hopHash>` — **the transaction is real**. Pause. Let them look.
4. `report 0x28C6...6045` — full court report at ~3s → `Export PDF` with SHA-256 footer.
5. `Re-verify` → `REPRODUCED` verdict on screen.
6. `/provenance` receipts. `/watch` → wallet registered, polling starts.
7. WSL: `bun run cli trace ...` against production — "same engine, any terminal."
8. Close: "The evidence doesn't need us to exist."

---

## Timing discipline

| Slot | Owner | Budget |
|---|---|---|
| Slides 1–2 | Anchal | 2:00 |
| Slide 3 | Pratyush | 1:00 |
| Slide 4 | Aryan | 1:00 |
| Slide 5 | Arush | 1:00 |
| Slide 6 | Aishwarya | 1:00 |
| Demo | Prakhar | 5:00 |

If any slide overruns, the demo shrinks — protect Prakhar's five minutes by ending slide six at 5:00 sharp. Aishwarya's handoff line doubles as the transition command.
