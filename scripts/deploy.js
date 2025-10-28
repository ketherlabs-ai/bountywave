const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("\n🚀 ===== BOUNTYWAVE DEPLOYMENT =====\n");

  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("📍 Network:", network);
  console.log("👤 Deployer:", deployer.address);

  const balance = await deployer.getBalance();
  console.log("💰 Balance:", hre.ethers.utils.formatEther(balance), "ETH\n");

  if (balance.eq(0)) {
    throw new Error("❌ Deployer has no funds! Please add ETH to continue.");
  }

  const feeCollector = process.env.FEE_COLLECTOR_ADDRESS || deployer.address;

  console.log("💵 Fee Collector:", feeCollector);
  console.log("\n📝 Deploying BountyWaveFactory...\n");

  const Factory = await hre.ethers.getContractFactory("BountyWaveFactory");

  const factory = await Factory.deploy(feeCollector);

  console.log("⏳ Waiting for deployment transaction...");

  await factory.deployed();

  console.log("\n✅ ===== DEPLOYMENT SUCCESSFUL =====\n");
  console.log("📋 Contract Addresses:");
  console.log("   Factory:", factory.address);
  console.log("   Fee Collector:", feeCollector);

  const deployTx = factory.deployTransaction;
  console.log("\n🔗 Transaction Hash:", deployTx.hash);

  const explorerBase = network === 'scrollSepolia'
    ? 'https://sepolia.scrollscan.com'
    : 'https://scrollscan.com';

  console.log(`\n🔍 View on Explorer:`);
  console.log(`   Contract: ${explorerBase}/address/${factory.address}`);
  console.log(`   Transaction: ${explorerBase}/tx/${deployTx.hash}`);

  const platformFee = await factory.platformFee();
  console.log(`\n💰 Platform Fee: ${platformFee.toString()} basis points (${platformFee.toNumber() / 100}%)`);

  const deploymentInfo = {
    network: network,
    chainId: network === 'scrollSepolia' ? 534351 : 534352,
    factoryAddress: factory.address,
    feeCollector: feeCollector,
    platformFee: platformFee.toString(),
    deployer: deployer.address,
    deploymentTx: deployTx.hash,
    timestamp: new Date().toISOString(),
    explorerUrl: `${explorerBase}/address/${factory.address}`,
    rpcUrl: network === 'scrollSepolia'
      ? 'https://sepolia-rpc.scroll.io'
      : 'https://rpc.scroll.io'
  };

  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log(`\n💾 Deployment info saved to: deployments/${network}.json`);

  console.log("\n📝 Add this to your .env file:");
  console.log(`VITE_FACTORY_CONTRACT_ADDRESS=${factory.address}`);
  console.log(`VITE_SCROLL_CHAIN_ID=${deploymentInfo.chainId}`);
  console.log(`VITE_SCROLL_RPC_URL=${deploymentInfo.rpcUrl}`);
  console.log(`VITE_SCROLL_EXPLORER_URL=${explorerBase}`);

  if (process.env.SCROLLSCAN_API_KEY) {
    console.log("\n⏳ Waiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log("\n🔍 Verifying contract on Scrollscan...\n");

    try {
      await hre.run("verify:verify", {
        address: factory.address,
        constructorArguments: [feeCollector],
      });

      console.log("\n✅ Contract verified successfully!");
      console.log(`   View verified code: ${explorerBase}/address/${factory.address}#code`);
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("\n✅ Contract already verified!");
      } else {
        console.error("\n❌ Verification failed:", error.message);
        console.log("\n📝 Manual verification command:");
        console.log(`npx hardhat verify --network ${network} ${factory.address} ${feeCollector}`);
      }
    }
  } else {
    console.log("\n⚠️  SCROLLSCAN_API_KEY not set. Skipping automatic verification.");
    console.log("\n📝 To verify manually:");
    console.log(`npx hardhat verify --network ${network} ${factory.address} ${feeCollector}`);
  }

  console.log("\n✨ ===== DEPLOYMENT COMPLETE =====\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ ===== DEPLOYMENT FAILED =====\n");
    console.error(error);
    process.exit(1);
  });
