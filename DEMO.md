# TraceChain — Demo & Operations Guide

## 1. Terminal (WSL) — exact commands

### One-time setup (per shell session)
```bash
cd /home/prakhar_upadhyay/projects/tracechain

# local engine
# TRACECHAIN_URL defaults to http://localhost:3000 (bun dev must be running)

# production engine
export TRACECHAIN_URL=https://tracechain-flax.vercel.app
export TRACECHAIN_API_KEY=df56a9712d6494b050c57140b675df6fbe1c091d80ff93e9
```

### Commands
```bash
bun run cli help
bun run cli status                       # (engine health via API)
bun run cli trace <address>              # multi-chain fund-flow trace
bun run cli nft <address>                # ERC-721/1155 history + exchange flags
bun run cli report <address> > report.md # trace + court-ready report
bun run cli trace <address> --json       # machine-readable output
```

### Browser terminal mirror
`https://tracechain-flax.vercel.app/terminal` — same commands, no install.
Try: `status` → `trace 0x28C6c06298d514Db089934071355E5743bf21d60`

### Local dev stack
```bash
cd /home/prakhar_upadhyay/projects/tracechain
bun install        # once
bun dev            # http://localhost:3000
bunx convex dev --once   # push Convex functions when schema changes
```

## 2. Verified demo addresses

### Ethereum (live hops, verifiable on etherscan.io)
```
0x28C6c06298d514Db089934071355E5743bf21d60   Binance hot — deep chain, risk ~80
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045   vitalik.eth
0x5041ed759Dd4aFc3a72b8192C143F72f4724081A   Bitfinex hot
0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe   Ethereum Foundation
```

### Bitcoin (live txids, verifiable on blockchain.info)
```
1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ           BitMEX cold — multi-thousand-BTC sweeps
1FzWLkAahHooV3kzTgyx6qsswXJ6sCXkSR           large hauler
3D2oetdNuZUqQHPJmcMDDHYoqkyNVsFk9r           Bitfinex cold
```

### BSC (live with real Etherscan key, else sandbox)
```
0x8894E0a0c962CB723c1976a4421c95949bE2D4E3   Binance hot on BSC
0x55d398326f99059fF775485246999027B3197955   BSC USDT contract
```

### NFT (Ethereum)
```
0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045   100 transfers, 31 collections
```

**Demo proof move:** after any trace, open `https://etherscan.io/tx/<hop txHash>` on screen — the transaction exists on the real ledger.

## 3. How everything works (architecture in one page)

**Request path.** Officer submits a suspect address (browser, terminal, or API). `/api/trace` validates it, detects the chain from address format, and attempts LIVE traversal:

- **ETH/BSC:** query confirmed transactions + token transfers, filter outgoing, aggregate by destination, rank by value, take top candidates.
- **BTC:** UTXO-aware — only follow transactions where the address is an input (sender), then follow the outputs.
- **TRON:** TRC-20 outgoing transfers (USDT — the dominant rail for Indian scam proceeds).

Each hop's destination is checked against the verified exchange-deposit dataset. Match → stop, name the exchange, mark the freeze target. No match → follow the largest-value unvisited target, up to 4 hops. Dead-end, throttle, or missing key → deterministic sandbox engine (seeded from the address, so identical input = identical output) — and every response is labeled `live` or `simulated` with the API probes used and the stop reason. Nothing in the product can lie about its data source.

**Reports.** The trace payload (hops, risk breakdown, exchange match) feeds gpt-oss-120b via OpenRouter, which writes a formal investigation report + freeze-request letter in Indian law-enforcement format. The same payload structure works from the browser UI, CLI, or raw API.

**NFTs.** ERC-721/1155 transfer events are indexed per address; any NFT landing on a known exchange deposit wallet is flagged — the signature of a rug-pull liquidation or wash-trade cash-out.

**Persistence & access.** Convex Auth (JWT sessions) gates the dashboard; `x-api-key` gates the REST API for CLI/integrations. Watched wallets are polled every 60s with per-wallet risk and source. Reports, cases, and correlations persist in the Convex schema; settings persist locally.

**3D graph.** The fund-flow chain renders as a left-to-right spine: victim → hops → exchange, with curved tube edges drawn progressively, risk-colored nodes (gray = wallet, orange = mixer, red = exchange), depth fog, and slow auto-orbit. Built with three.js; shared by the landing demo loop and live traces.

## 4. Why we beat existing tools

| Dimension | Enterprise suites (Chainalysis/Elliptic) | TraceChain |
|---|---|---|
| Cost | Lakhs per seat, per year | Near-zero — free-tier APIs, open-source stack |
| Operator | Trained forensic analyst | Any constable, zero blockchain training |
| Time to verdict | Days, analyst-queued | Under a minute, self-serve |
| Deployment | Central agencies only | Every district cybercrime cell |
| Evidence | Readable PDF | Hash-anchored report + verifiable public tx hashes |
| Cash-out flow | Crypto only | Crypto → exchange identification → auto-drafted freeze letter |
| Surveillance risk | Tool-dependent | Reactive only (victim-reported addresses), full audit trail, officer owns judgment |
| Access | GUI license seats | Browser, terminal, CLI, raw API — one engine |

**The one-line pitch:** existing tools are priced for ministries and staffed by analysts; TraceChain is built for the station officer who receives the complaint — self-serve, near-zero cost, court-ready in minutes, and every claim verifiable on a public ledger.
