const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const network = hre.network.name;

  const deploymentFile = path.join(__dirname, '..', 'deployments', `${network}.json`);

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`No deployment found for network ${network}. Please deploy first.`);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));

  console.log("\n🔍 ===== CONTRACT VERIFICATION =====\n");
  console.log("📍 Network:", network);
  console.log("📋 Factory Address:", deployment.factoryAddress);
  console.log("💵 Fee Collector:", deployment.feeCollector);

  const explorerBase = network === 'scrollSepolia'
    ? 'https://sepolia.scrollscan.com'
    : 'https://scrollscan.com';

  try {
    await hre.run("verify:verify", {
      address: deployment.factoryAddress,
      constructorArguments: [deployment.feeCollector],
    });

    console.log("\n✅ Contract verified successfully!");
    console.log(`   View verified code: ${explorerBase}/address/${deployment.factoryAddress}#code`);

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("\n✅ Contract already verified!");
      console.log(`   View verified code: ${explorerBase}/address/${deployment.factoryAddress}#code`);
    } else {
      console.error("\n❌ Verification failed:", error.message);
      console.log("\n💡 Troubleshooting:");
      console.log("   1. Make sure SCROLLSCAN_API_KEY is set in .env");
      console.log("   2. Wait a few minutes after deployment");
      console.log("   3. Check that the contract address is correct");
      console.log(`   4. Manually verify at: ${explorerBase}/verifyContract`);
    }
  }

  console.log("\n✨ ===== VERIFICATION COMPLETE =====\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ===== VERIFICATION FAILED =====\n");
    console.error(error);
    process.exit(1);
  });
