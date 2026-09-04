export interface ExchangeLabel {
  address: string;
  chain: "eth" | "btc" | "bsc" | "tron";
  name: string;
  walletType: "hot" | "cold" | "deposit";
}

export const EXCHANGE_LABELS: ExchangeLabel[] = [
  // Binance
  { address: "0x28C6c06298d514Db089934071355E5743bf21d60", chain: "eth", name: "Binance", walletType: "hot" },
  { address: "0x21a31Ee1afC51d94C2eFcCAa2092aD1028285549", chain: "eth", name: "Binance", walletType: "hot" },
  { address: "0xDFd5293D8e347dFe59E90eFd55b2956a1343963d", chain: "eth", name: "Binance", walletType: "deposit" },
  { address: "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8", chain: "eth", name: "Binance", walletType: "cold" },
  // Coinbase
  { address: "0x71660c4005BA85c37ccec55d0C4493E66Fe775d3", chain: "eth", name: "Coinbase", walletType: "hot" },
  { address: "0x503828976D22510aad0201ac7EC88293211D23Da", chain: "eth", name: "Coinbase", walletType: "deposit" },
  // Kraken
  { address: "0x2910543Af39abA0Cd09dBb2D50200b3E800A63D2", chain: "eth", name: "Kraken", walletType: "hot" },
  // WazirX
  { address: "0x0F6C4eC6c4758f45A8d7833B1c1f3D0a38dBf2f0", chain: "eth", name: "WazirX", walletType: "hot" },
  // OKX
  { address: "0x6cC5F688a315f3dC28A7781717a9A798a59fDA7b", chain: "eth", name: "OKX", walletType: "hot" },
];
