import React, { createContext, useContext, useState, useEffect } from "react";
import EtherDocsClient from "../lib/EtherDocsClient";
import Etherdocs from "../lib/Etherdocs.json";
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
      // Switch network to localhost
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x7A69" }], // Hardhat default
        });
      } catch (switchError) {
        // Add chain if not exists
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x7A69",
                chainName: "Localhost 8545",
                rpcUrls: ["http://127.0.0.1:8545"],
                nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
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
      await client.setup(Etherdocs.abi, config.contractAddress);
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
