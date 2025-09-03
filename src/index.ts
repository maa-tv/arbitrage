import { ethers } from "ethers";
import { FlashbotsBundleProvider, FlashbotsBundleResolution } from "@flashbots/ethers-provider-bundle";

// ENV from GitHub secrets
const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const RELAYS = [
  process.env.MEV_BLOCKER_URL || "https://rpc.mevblocker.io",
  "https://cow-relay.flashbots.net",   // CoW Swap intents relay
  "https://rpc.blxrbdn.com"            // bloXroute/Blink relay
];

// Ethereum mainnet provider
const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_API_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// Routers
const UNISWAP_ROUTER = "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";
const SUSHISWAP_ROUTER = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F";

// ERC20 tokens
const TOKENS: Record<string, string> = {
  WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  DAI:  "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
};

// Pairs to scan
const PAIRS = [
  ["WETH", "DAI"],
  ["WETH", "USDC"],
  ["USDC", "DAI"],
  ["USDC", "USDT"]
];

// ABI
const routerAbi = [
  "function getAmountsOut(uint amountIn, address[] memory path) external view returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)"
];

const uni = new ethers.Contract(UNISWAP_ROUTER, routerAbi, wallet);
const sushi = new ethers.Contract(SUSHISWAP_ROUTER, routerAbi, wallet);

async function init() {
  // Connect to multiple relays
  const relays: FlashbotsBundleProvider[] = [];
  for (const url of RELAYS) {
    try {
      const fb = await FlashbotsBundleProvider.create(provider, wallet, url);
      if (fb) {
        console.log("✅ Connected to relay:", url);
        relays.push(fb);
      }
    } catch (err) {
      console.error("Relay connect failed:", url, err);
    }
  }

  if (relays.length === 0) throw new Error("❌ No relays available");

  const amountIn = ethers.utils.parseEther("1"); // test with 1 WETH or equiv

  setInterval(async () => {
    try {
      for (const [base, quote] of PAIRS) {
        const path = [TOKENS[base], TOKENS[quote]];

        const uniOut = await uni.getAmountsOut(amountIn, path);
        const sushiOut = await sushi.getAmountsOut(amountIn, path);

        const uniPrice = parseFloat(ethers.utils
