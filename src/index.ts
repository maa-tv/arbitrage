import { ethers } from "ethers";
import { FlashbotsBundleProvider } from "@flashbots/ethers-provider-bundle";

const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const MEV_BLOCKER_URL = process.env.MEV_BLOCKER_URL || "https://rpc.mevblocker.io";

// Ethereum provider (Alchemy mainnet)
const provider = new ethers.providers.JsonRpcProvider(ALCHEMY_API_URL);

// Wallet signer (no ETH needed)
const authSigner = new ethers.Wallet(PRIVATE_KEY, provider);

async function init() {
  const flashbots = await FlashbotsBundleProvider.create(
    provider,
    authSigner,
    MEV_BLOCKER_URL
  );

  if (!flashbots) {
    throw new Error("❌ Could not connect to MEV Blocker relay");
  }

  console.log("✅ Connected to MEV Blocker:", MEV_BLOCKER_URL);
}

init().catch((err) => {
  console.error("❌ Bot crashed:", err);
});
