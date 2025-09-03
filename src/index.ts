import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";
import { ethers } from "ethers";

// Load environment variables
require("dotenv").config();

const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const MEV_BLOCKER_URL = process.env.MEV_BLOCKER_URL || "https://rpc.mevblocker.io";

// Provider for Ethereum mainnet
const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_API_URL);

// Wallet used to sign transactions (no ETH needed, just for auth)
const authSigner = new ethers.Wallet(PRIVATE_KEY, provider);

async function init() {
  // Connect to MEV Blocker relay instead of Flashbots default
  const flashbots = await FlashbotsBundleProvider.create(
    provider,
    authSigner,
    MEV_BLOCKER_URL
  );

  if (!flashbots) {
    throw new Error("Could not connect to MEV Blocker relay");
  }

  console.log("✅ Connected to MEV Blocker:", MEV_BLOCKER_URL);

  // Example placeholder (replace with your arb logic)
  // Here you’d listen for opportunities and submit bundles
}

init().catch(console.error);
