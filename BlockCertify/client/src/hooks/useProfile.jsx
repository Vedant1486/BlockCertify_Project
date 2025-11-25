import React, { useState, useContext, useEffect, useMemo } from "react";

const profileContext = React.createContext();

export const useProfile = () => {
  return useContext(profileContext);
};

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [account, setAccount] = useState(null);

  // 1️⃣ Load connected wallet address from MetaMask
  useEffect(() => {
    async function loadAccount() {
      try {
        if (!window.ethereum) {
          console.warn("MetaMask not detected");
          return;
        }

        const accounts = await window.ethereum.request({
  method: "eth_accounts",
});


        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
        }
      } catch (err) {
        console.error("MetaMask error:", err);
      }
    }

    loadAccount();

    // Listen for account change
    window.ethereum?.on("accountsChanged", (acc) => {
      setAccount(acc[0] || null);
    });
  }, []);

  // 2️⃣ Inject wallet address into profile
  useEffect(() => {
    if (!account) return;

    setProfile((prev) => ({
      ...(prev || {}),
      address: account, // ensure certificate page gets the wallet
    }));
  }, [account]);

  // 3️⃣ Reactive registration flag
  const isRegistered = useMemo(() => {
    if (!profile) return false;
    return profile.role !== "NA";
  }, [profile]);

  console.debug("profile state updated:", profile);

  return (
    <profileContext.Provider
      value={{ profile, setProfile, isRegistered }}
    >
      {children}
    </profileContext.Provider>
  );
}
