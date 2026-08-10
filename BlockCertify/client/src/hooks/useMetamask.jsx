import React, { createContext, useContext, useState, useEffect } from "react";
import EtherDocsClient from "../lib/EtherDocsClient";
import config from "../config";
import { useProfile } from "./useProfile";
import { useClient } from "./useClient";

export const metamaskContext = createContext();
export const useMetamask = () => useContext(metamaskContext);

export const MetamaskProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { setProfile } = useProfile();
  const { setClient } = useClient();

  // Connect Wallet + Switch Network
  const connect = async () => {
    if (!window.ethereum) {
      alert("MetaMask not installed!");
      return;
    }

    try {
      // Switch network to Sepolia
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0xaa36a7" }],
        });
      } catch (switchError) {
        if (switchError.code === 4902) {
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
          throw switchError;
        }
      }

      // Request accounts
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length === 0) throw new Error("No account found");

      setAccount(accounts[0]);
      setIsConnected(true);

      // Setup client
      const client = new EtherDocsClient();
      await client.setup(config.contractAddress);
      setClient(client);

      const profileRet = await client.getProfile();
      setProfile(profileRet);
    } catch (err) {
      console.error("Failed to connect MetaMask:", err);
      alert("Failed to connect MetaMask. Check network & account.");
    }
  };

  // Listen for account/network changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
          setIsConnected(false);
        } else {
          setAccount(accounts[0]);
          setIsConnected(true);
        }
      };

      const handleChainChanged = () => window.location.reload();

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, []);

  return (
    <metamaskContext.Provider value={{ account, connect, isConnected }}>
      {children}
    </metamaskContext.Provider>
  );
};
