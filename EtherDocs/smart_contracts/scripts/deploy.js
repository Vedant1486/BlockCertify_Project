// scripts/deploy.js
const fs = require("fs");
const path = require("path");

async function main() {
  const EtherDocs = await ethers.getContractFactory("EtherDocs");
  console.log("🚀 Deploying EtherDocs...");
  const etherDocs = await EtherDocs.deploy();
  await etherDocs.waitForDeployment();

  const address = await etherDocs.getAddress();
  console.log(`✅ EtherDocs deployed to: ${address}`);

  // Paths to frontend files
  const envPath = path.join(__dirname, "../../client/.env");
  const abiPath = path.join(__dirname, "../../client/src/abi.json");

  // Update .env with contract address
  fs.writeFileSync(envPath, `REACT_APP_CONTRACT_ADDRESS=${address}\n`);
  console.log(`✅ Updated .env with contract address: ${address}`);

  // Write ABI to abi.json
  const artifact = await artifacts.readArtifact("EtherDocs");
  fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2));
  console.log(`✅ ABI updated at: ${abiPath}`);

  console.log("⚠️ Remember: Restart your React app to load the new .env file!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
