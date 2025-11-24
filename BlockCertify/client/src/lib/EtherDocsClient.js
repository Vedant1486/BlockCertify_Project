// client/src/lib/EtherDocsClient.js
import { BrowserProvider, Contract } from "ethers";
import contractABI from "../abi.json";

class EtherDocsClient {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
  }

  // Connect to MetaMask and ensure Sepolia
  async connectMetaMask() {
    if (!window.ethereum) throw new Error("MetaMask not found");
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // switch to Sepolia
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });
    } catch (switchErr) {
      if (switchErr.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xaa36a7",
              chainName: "Sepolia Testnet",
              rpcUrls: [process.env.REACT_APP_NETWORK_RPC || "https://eth-sepolia.g.alchemy.com/v2/REPLACE_ME"],
              nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
              blockExplorerUrls: ["https://sepolia.etherscan.io"],
            },
          ],
        });
      } else {
        throw switchErr;
      }
    }

    this.provider = new BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();
  }

  // setup(contract address) — uses signer/provider that must be set already
  async setup(address) {
    if (!this.signer && !this.provider) {
      // attempt to connect MetaMask automatically
      await this.connectMetaMask();
    }
    const signerOrProvider = this.signer || this.provider;
    this.contract = new Contract(address, contractABI, signerOrProvider);
    console.log("✅ Contract setup at:", address);
  }

  // the rest of your safe helper methods (copy yours)
  async _retryRpc(fn, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i === retries - 1) throw err;
        console.warn(`⚠ RPC call failed, retrying in ${delay}ms...`, err.message);
        await new Promise((res) => setTimeout(res, delay));
        delay *= 2;
      }
    }
  }

  async isRegistered() {
    if (!this.contract) throw new Error("Contract not initialized");
    return this._retryRpc(() => this.contract.isRegistered());
  }
  async isUser() {
    if (!this.contract) throw new Error("Contract not initialized");
    return this._retryRpc(() => this.contract.isUser());
  }
  async isIssuer() {
    if (!this.contract) throw new Error("Contract not initialized");
    return this._retryRpc(() => this.contract.isIssuer());
  }

  async getProfile() {
    try {
      if (!this.contract) throw new Error("Contract not initialized");
      const registered = await this.isRegistered();
      if (!registered) return null;
      const res = await this._retryRpc(() => this.contract.getProfile());
      return { address: res[0], name: res[1], role: res[2] };
    } catch (err) {
      console.error("❌ getProfile failed:", err.message);
      return null;
    }
  }

  async getProfileByAddress(address) {
    try {
      if (!this.contract) throw new Error("Contract not initialized");
      const res = await this._retryRpc(() => this.contract.getProfileByAddress(address));
      if (!res || res[0] === "0x0000000000000000000000000000000000000000") return null;
      return { address: res[0], name: res[1], role: res[2] };
    } catch (err) {
      console.error("❌ getProfileByAddress failed:", err.message);
      return null;
    }
  }

  async registerUser(name) {
    try {
      const tx = await this._retryRpc(() => this.contract.registerUser(name));
      await tx.wait();
      console.log("✅ User registered");
    } catch (err) {
      console.error("❌ registerUser failed:", err.message);
    }
  }

  async registerIssuer(name) {
    try {
      const tx = await this._retryRpc(() => this.contract.registerIssuer(name));
      await tx.wait();
      console.log("✅ Issuer registered");
    } catch (err) {
      console.error("❌ registerIssuer failed:", err.message);
    }
  }

  async issueCertificate(name, userAddr, uuid, hashValue, ipfsUrl) {
    try {
      const tx = await this._retryRpc(() => this.contract.issueCertificate(name, userAddr, uuid, hashValue, ipfsUrl));
      await tx.wait();
      console.log("✅ Certificate issued");
      return true;
    } catch (err) {
      console.error("❌ issueCertificate failed:", err.message);
      return false;
    }
  }

  async invalidateCertificate(uuid) {
    try {
      const tx = await this._retryRpc(() => this.contract.invalidateCertificate(uuid));
      await tx.wait();
      return true;
    } catch (err) {
      console.error("❌ invalidateCertificate failed:", err.message);
      return false;
    }
  }

  async getCertificate(uuid) {
    try {
      const result = await this._retryRpc(() => this.contract.getCertificate(uuid));
      return {
        name: result[0],
        issuerAddr: result[1],
        userAddr: result[2],
        uuid: result[3],
        ipfsUrl: result[4],
        isValid: result[5],
      };
    } catch (err) {
      console.error("❌ getCertificate failed:", err.message);
      return null;
    }
  }

  async verifyCertificate(uuid, issuerAddr, userAddr, hashValue) {
    try {
      return await this._retryRpc(() => this.contract.verifyCertificate(uuid, issuerAddr, userAddr, hashValue));
    } catch (err) {
      console.error("❌ verifyCertificate failed:", err.message);
      return null;
    }
  }

  async getCertificatesIssuedFor() {
    try {
      const uuids = await this._retryRpc(() => this.contract.getCertificatesIssuedFor());
      return Promise.all(uuids.map((uuid) => this.getCertificate(uuid)));
    } catch (err) {
      console.error("❌ getCertificatesIssuedFor failed:", err.message);
      return [];
    }
  }

  async getCertificatesIssuedBy() {
    try {
      const uuids = await this._retryRpc(() => this.contract.getCertificatesIssuedBy());
      return Promise.all(uuids.map((uuid) => this.getCertificate(uuid)));
    } catch (err) {
      console.error("❌ getCertificatesIssuedBy failed:", err.message);
      return [];
    }
  }
}

export default EtherDocsClient;
