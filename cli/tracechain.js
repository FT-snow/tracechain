#!/usr/bin/env bun
const BASE = process.env.TRACECHAIN_URL || "http://localhost:3000";

const USAGE = `tracechain — wallet tracing CLI

usage:
  tracechain trace <wallet-address> [--chain BTC|ETH|BSC|TRX] [--json]
  tracechain nft <eth-address> [--json]
  tracechain help

env:
  TRACECHAIN_URL   API base url (default http://localhost:3000)
  TRACECHAIN_API_KEY  API key (sent as x-api-key header)`;

async function trace(args) {
  const address = args.find((a) => !a.startsWith("--"));
  if (!address) {
    console.error("error: missing wallet address\n");
    console.log(USAGE);
    process.exit(1);
  }

  const chainIdx = args.indexOf("--chain");
  const chain = chainIdx !== -1 ? args[chainIdx + 1] : undefined;
  const json = args.includes("--json");

  let res;
  try {
    res = await fetch(`${BASE}/api/trace`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.TRACECHAIN_API_KEY
          ? { "x-api-key": process.env.TRACECHAIN_API_KEY }
          : {}),
      },
      body: JSON.stringify({ address, chain }),
    });
  } catch (e) {
    console.error(`error: cannot reach ${BASE} — is the server running?`);
    process.exit(1);
  }

  const data = await res.json();
  if (!res.ok) {
    console.error(`error: ${data.error || res.status}`);
    process.exit(1);
  }

  if (json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  const pad = (s, n) => String(s).padEnd(n);
  const short = (a) => (a.length > 14 ? a.slice(0, 8) + "..." + a.slice(-4) : a);
  const time = (t) => new Date(t).toISOString().replace("T", " ").slice(0, 19);

  console.log(`TRACE ${data.address}`);
  console.log(`chain: ${data.chain}   risk: ${data.riskScore}/99   source: ${data.source === "live" ? "live chain apis" : "simulated"}${data.stoppedOn && data.source === "live" ? `   stopped: ${data.stoppedOn}` : ""}${data.mixerContact ? "   mixer contact: yes" : ""}`);
  if (data.exchangeMatch) {
    console.log(`exchange: ${data.exchangeMatch.name} (confidence ${data.exchangeMatch.confidence})`);
    console.log(`deposit:  ${data.exchangeMatch.depositAddress}`);
  }
  console.log("");
  console.log(`${pad("HOP", 4)}${pad("FROM", 18)}${pad("TO", 18)}${pad("AMOUNT", 12)}${pad("CHAIN", 7)}${pad("TIME", 21)}TX`);
  for (const h of data.hops) {
    console.log(
      `${pad(h.hopNumber, 4)}${pad(short(h.from), 18)}${pad(short(h.to), 18)}${pad(h.amount, 12)}${pad(h.chain, 7)}${pad(time(h.timestamp), 21)}${short(h.txHash)}`
    );
  }
  console.log("");
  console.log(`${data.hops.length} hops traced. Court-ready report: POST ${BASE}/api/report`);
}

async function nft(args) {
  const address = args.find((a) => !a.startsWith("--"));
  if (!address) {
    console.error("error: missing address\n");
    console.log(USAGE);
    process.exit(1);
  }
  const json = args.includes("--json");

  let res;
  try {
    res = await fetch(`${BASE}/api/nft`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.TRACECHAIN_API_KEY
          ? { "x-api-key": process.env.TRACECHAIN_API_KEY }
          : {}),
      },
      body: JSON.stringify({ address }),
    });
  } catch {
    console.error(`error: cannot reach ${BASE} — is the server running?`);
    process.exit(1);
  }

  const data = await res.json();
  if (!res.ok) {
    console.error(`error: ${data.error || res.status}`);
    process.exit(1);
  }
  if (json) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  const pad = (s, n) => String(s).padEnd(n);
  const short = (a) => (!a ? "" : a.length > 13 ? a.slice(0, 7) + "..." + a.slice(-4) : a);
  const time = (t) => new Date(t).toISOString().slice(0, 16).replace("T", " ");

  console.log(`NFT TRANSFERS ${data.address}`);
  console.log(
    `received: ${data.summary.received}   sent: ${data.summary.sent}   flagged to exchange: ${data.summary.flagged}   collections: ${data.summary.collections}`
  );
  console.log("");
  console.log(
    `${pad("COLLECTION", 20)}${pad("ID", 12)}${pad("STD", 9)}${pad("FROM", 15)}${pad("TO", 15)}${pad("TIME", 18)}TX`
  );
  for (const t of data.transfers.slice(0, 25)) {
    console.log(
      `${pad(t.collection.slice(0, 19), 20)}${pad(t.tokenId.slice(0, 11), 12)}${pad(t.standard.slice(0, 8), 9)}${pad(short(t.from), 15)}${pad(short(t.to) + (t.toExchange ? "*" : ""), 15)}${pad(time(t.timestamp), 18)}${short(t.txHash)}`
    );
  }
  console.log("");
  console.log(
    `${Math.min(25, data.transfers.length)} of ${data.transfers.length} transfers shown. Flags: TO marked when destination is a known exchange wallet.`
  );
}

const [cmd, ...args] = process.argv.slice(2);

if (cmd === "trace") await trace(args);
else if (cmd === "nft") await nft(args);
else if (cmd === "help" || !cmd) console.log(USAGE);
else {
  console.error(`unknown command: ${cmd}\n`);
  console.log(USAGE);
  process.exit(1);
}
