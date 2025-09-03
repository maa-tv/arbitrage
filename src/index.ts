async function executeArb(
  relays: FlashbotsBundleProvider[],
  buyRouter: ethers.Contract,
  sellRouter: ethers.Contract,
  amountIn: any,
  path: string[]
) {
  const block = await provider.getBlockNumber();
  const deadline = Math.floor(Date.now() / 1000) + 60;

  const buyTx = await buyRouter.populateTransaction.swapExactTokensForTokens(
    amountIn,
    0,
    path,
    wallet.address,
    deadline
  );

  const sellTx = await sellRouter.populateTransaction.swapExactTokensForTokens(
    amountIn,
    0,
    path,
    wallet.address,
    deadline
  );

  const bundle = [
    {
      signer: wallet,
      transaction: { ...buyTx, chainId: 1, gasPrice: 0, gasLimit: 500000 }
    },
    {
      signer: wallet,
      transaction: { ...sellTx, chainId: 1, gasPrice: 0, gasLimit: 500000 }
    }
  ];

  for (const relay of relays) {
    try {
      const result = await relay.sendBundle(bundle, block + 1);
      console.log("📤 Bundle sent to relay:", relay.connection.url);

      // ✅ Instead of result.wait(), check inclusion another way
      if ("wait" in result && typeof result.wait === "function") {
        const resolution = await result.wait();
        console.log("⏳ Bundle resolution:", resolution);
      } else {
        console.log("⚡ Bundle submitted (no wait() available in this SDK).");
      }

    } catch (err) {
      console.error("Bundle failed on relay:", relay.connection.url, err);
    }
  }
}
