import React from "react";
import {
  Heading,
  useBreakpointValue,
  useColorModeValue,
  Container,
} from "@chakra-ui/react";
import styles from "../styles/Home.module.css";
const WarningInstallMetaMask = () => {
  return (
    <main className={styles.main}>
      <Container py={{ base: "4", md: "12" }} maxW={"7xl"} align={"left"}>
        {" "}
        <Heading
          textAlign={useBreakpointValue({ base: "left" })}
          fontFamily={"heading"}
          color={useColorModeValue("gray.800", "white")}
          as="h1"
          py={4}
        >
          You need install MetaMask Wallet
        </Heading>
      </Container>
    </main>
  );
};

export default WarningInstallMetaMask;
