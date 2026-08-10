// client/src/hooks/useClient.jsx
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
        // 1) ensure user allows accounts
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // 2) request network switch to Sepolia (0xaa36a7 == 11155111)
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
                  rpcUrls: ["https://eth-sepolia.g.alchemy.com/v2/alch_NdmKpqsE7xM1eMzC-UMoo"],
                  nativeCurrency: { name: "Sepolia ETH", symbol: "ETH", decimals: 18 },
                  blockExplorerUrls: ["https://sepolia.etherscan.io"],
                },
              ],
            });
          } else {
            throw switchErr;
          }
        }

        // 3) create provider & signer from MetaMask
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // 4) contract address (deploy script writes this into client/.env)
        const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
        if (!contractAddress) {
          console.error("❌ REACT_APP_CONTRACT_ADDRESS not set in client/.env");
          return;
        }

        // 5) create contract instance
        const contract = new Contract(contractAddress, contractABI, signer);
        console.log("✅ Client initialized on Sepolia:", contractAddress);
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