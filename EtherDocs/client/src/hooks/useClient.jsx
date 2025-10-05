import React, { useState, useContext, useEffect } from "react";
import { BrowserProvider, Contract } from "ethers";
import contractABI from "../abi.json";

const clientContext = React.createContext();

export const useClient = () => {
  return useContext(clientContext);
};

export function ClientProvider({ children }) {
  const [client, setClient] = useState(null);

  useEffect(() => {
    async function init() {
      if (!window.ethereum) {
        console.warn("⚠️ MetaMask not found");
        return;
      }

      try {
        // Ask user to connect wallet
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // ✅ ethers v6 provider + signer
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Replace with deployed contract address (from .env)
        const contractAddress =
          process.env.REACT_APP_CONTRACT_ADDRESS ||
          "0x5FbDB2315678afecb367f032d93F642f64180aa3";

        // ✅ since your abi.json is an array, just pass contractABI directly
        const contract = new Contract(contractAddress, contractABI, signer);

        console.log("✅ Client initialized:", contract.target);
        setClient(contract);
      } catch (err) {
        console.error("❌ Failed to init client:", err);
      }
    }

    init();
  }, []);

  return (
    <clientContext.Provider value={{ client, setClient }}>
      {children}
    </clientContext.Provider>
  );
}
