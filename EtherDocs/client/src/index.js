import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { ProfileProvider } from "./hooks/useProfile";
import { ClientProvider } from "./hooks/useClient";
import { MetamaskProvider } from "./hooks/useMetamask";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ChakraProvider>
      <ProfileProvider>
        <ClientProvider>
          <MetamaskProvider>
            <App />
          </MetamaskProvider>
        </ClientProvider>
      </ProfileProvider>
    </ChakraProvider>
  </React.StrictMode>
);
