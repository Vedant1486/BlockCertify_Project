//@ts-check
import { BrowserProvider, Contract } from "ethers";

class EtherDocsClient {
  constructor() {
    //@ts-expect-error
    this.provider = new BrowserProvider(window.ethereum);
    this.signer = null;
    this.contract = null;
  }

  async setup(abi, address) {
    this.signer = await this.provider.getSigner();
    this.contract = new Contract(address, abi, this.signer);
    console.log("✅ Contract setup at:", address);
  }

  // ---------- USER / ISSUER CHECKS ----------
  async isRegistered() {
    if (!this.contract) throw new Error("Contract not initialized");
    try {
      return await this.contract.isRegistered();
    } catch {
      return false;
    }
  }

  async isUser() {
    if (!this.contract) throw new Error("Contract not initialized");
    return await this.contract.isUser();
  }

  async isIssuer() {
    if (!this.contract) throw new Error("Contract not initialized");
    return await this.contract.isIssuer();
  }

  // ---------- PROFILE ----------
  async getProfile() {
    try {
      if (!this.contract) throw new Error("Contract not initialized");
      const res = await this.contract.getProfile();
      // If user not registered
      if (!res || res[0] === "0x0000000000000000000000000000000000000000") {
        return null;
      }
      return {
        address: res[0],
        name: res[1],
        role: res[2],
      };
    } catch (err) {
      console.warn("❌ getProfile failed, user not registered:", err.message);
      return null;
    }
  }

  async getProfileByAddress(address) {
    try {
      if (!this.contract) throw new Error("Contract not initialized");
      const res = await this.contract.getProfileByAddress(address);
      if (!res || res[0] === "0x0000000000000000000000000000000000000000") return null;
      return {
        address: res[0],
        name: res[1],
        role: res[2],
      };
    } catch (err) {
      console.error("❌ getProfileByAddress failed:", err.message);
      return null;
    }
  }

  async registerUser(name) {
    const tx = await this.contract.registerUser(name);
    await tx.wait();
    console.log("✅ User registered");
  }

  async registerIssuer(name) {
    const tx = await this.contract.registerIssuer(name);
    await tx.wait();
    console.log("✅ Issuer registered");
  }

  // ---------- CERTIFICATES ----------
  async issueCertificate(name, userAddr, uuid, hashValue, ipfsUrl) {
    try {
      const tx = await this.contract.issueCertificate(name, userAddr, uuid, hashValue, ipfsUrl);
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
      const tx = await this.contract.invalidateCertificate(uuid);
      await tx.wait();
      return true;
    } catch (err) {
      console.error("❌ invalidateCertificate failed:", err.message);
      return false;
    }
  }

  async getCertificate(uuid) {
    try {
      const result = await this.contract.getCertificate(uuid);
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
      return await this.contract.verifyCertificate(uuid, issuerAddr, userAddr, hashValue);
    } catch (err) {
      console.error("❌ verifyCertificate failed:", err.message);
      return null;
    }
  }

  async getCertificatesIssuedFor() {
    try {
      const uuids = await this.contract.getCertificatesIssuedFor();
      return Promise.all(uuids.map((uuid) => this.getCertificate(uuid)));
    } catch (err) {
      console.error("❌ getCertificatesIssuedFor failed:", err.message);
      return null;
    }
  }

  async getCertificatesIssuedBy() {
    try {
      const uuids = await this.contract.getCertificatesIssuedBy();
      return Promise.all(uuids.map((uuid) => this.getCertificate(uuid)));
    } catch (err) {
      console.error("❌ getCertificatesIssuedBy failed:", err.message);
      return null;
    }
  }
}

export default EtherDocsClient;
