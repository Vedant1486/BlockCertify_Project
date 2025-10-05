import "./App.css";
import { useEffect, useState } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import ConnectWalletPage from "./pages/ConnectWalletPage";
import NotRegisteredUserPage from "./pages/NotRegisteredUserPage";
import RegisteredUserPage from "./pages/RegisteredUserPage";
import StudentForm from "./pages/StudentForm";
import IssuerForm from "./pages/IssuerForm";
import StudentIsRegistered from "./pages/StudentIsRegistered";
import IssuerIsRegistered from "./pages/IssuerIsRegistered";
import IssueNewCertiForm from "./pages/IssueNewCertiForm";
import VerifyForm from "./pages/VerifyForm";
import CertificatePage from "./pages/CertificatePage";
import WarningInstallMetaMask from "./pages/WarningInstallMetaMask";

import { useProfile } from "./hooks/useProfile";
import { useClient } from "./hooks/useClient";
import { useMetamask } from "./hooks/useMetamask";
import EtherDocsClient from "./lib/EtherDocsClient";
import Etherdocs from "./lib/Etherdocs.json";
import config from "./config";

function App() {
  const [isMetamaskInstalled] = useState(typeof window.ethereum !== "undefined");
  const { setProfile } = useProfile();
  const { isConnected } = useMetamask();
  const { setClient } = useClient();

  useEffect(() => {
    const setupClient = async () => {
      if (isMetamaskInstalled && isConnected) {
        try {
          // Request accounts
          await window.ethereum.request({ method: "eth_requestAccounts" });

          const client = new EtherDocsClient();
          await client.setup(Etherdocs.abi, config.contractAddress);
          setClient(client);
          window.__etherdocs = client;

          const profile = await client.getProfile();
          setProfile(profile); // may be null if not registered
        } catch (err) {
          console.error("❌ Error in client setup:", err);
        }
      }
    };

    setupClient();
  }, [isConnected, isMetamaskInstalled, setClient, setProfile]);

  return (
    <ChakraProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/connect-wallet" />} />
          <Route path="/connect-wallet" element={<ConnectWalletPage />} />
          <Route path="/home" element={<LandingPage />} />
          <Route path="/install-metamask" element={<WarningInstallMetaMask />} />
          <Route path="/is-registered" element={<RegisteredUserPage />} />
          <Route path="/is-registered/student" element={<StudentIsRegistered />} />
          <Route path="/is-registered/issuer" element={<IssuerIsRegistered />} />
          <Route path="/issuer/new-certificate" element={<IssueNewCertiForm />} />
          <Route path="/is-not-registered" element={<NotRegisteredUserPage />} />
          <Route path="/is-not-registered/verify" element={<VerifyForm />} />
          <Route path="/is-not-registered/student" element={<StudentForm />} />
          <Route path="/is-not-registered/issuer" element={<IssuerForm />} />
          <Route path="/certificate/:uuid" element={<CertificatePage />} />
        </Routes>
      </Router>
    </ChakraProvider>
  );
}

export default App;
