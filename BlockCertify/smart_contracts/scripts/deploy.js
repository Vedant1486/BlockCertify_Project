// scripts/deploy.js
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Deploying EtherDocs to Sepolia...");

  const EtherDocs = await ethers.getContractFactory("EtherDocs");
  const etherDocs = await EtherDocs.deploy();
  await etherDocs.waitForDeployment();

  const address = await etherDocs.getAddress();
  console.log(`✅ EtherDocs deployed to: ${address}`);

  // ------------- write contract address to client/.env -------------
  const clientEnvPath = path.join(__dirname, "..", "..", "client", ".env");
  let envContent = "";
  if (fs.existsSync(clientEnvPath)) {
    envContent = fs.readFileSync(clientEnvPath, "utf8");
  }

  // helper to set or replace a key in env content
  function setEnvKey(content, key, value) {
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(content)) {
      return content.replace(re, `${key}=${value}`);
    } else {
      // append with newline (if content non-empty ensure trailing newline)
      const prefix = content && !content.endsWith("\n") ? content + "\n" : content;
      return prefix + `${key}=${value}\n`;
    }
  }

  envContent = setEnvKey(envContent, "REACT_APP_CONTRACT_ADDRESS", address);
  // keep any existing REACT_APP_NETWORK_RPC / REACT_APP_PRIVATE_KEY if present
  fs.writeFileSync(clientEnvPath, envContent, "utf8");
  console.log(`✅ Updated client .env at ${clientEnvPath}`);

  // ------------- write ABI to client/src/abi.json -------------
  const artifact = await artifacts.readArtifact("EtherDocs");
  const abiPath = path.join(__dirname, "..", "..", "client", "src", "abi.json");
  const abiDir = path.dirname(abiPath);
  if (!fs.existsSync(abiDir)) fs.mkdirSync(abiDir, { recursive: true });
  fs.writeFileSync(abiPath, JSON.stringify(artifact.abi, null, 2), "utf8");
  console.log(`✅ Wrote ABI to ${abiPath}`);

  console.log("⚠️ Done. Restart your React dev server to pick up the new .env.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Deployment failed:", err);
    process.exit(1);
  });
