// client/src/pages/CertificatePage.js
import React, { useState, useEffect } from "react";
import {
  Heading,
  Container,
  Box,
  Table,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  SkeletonCircle,
  Divider,
  useColorModeValue,
  Button,
  Text,
  Badge,
  Center,
  VStack,
} from "@chakra-ui/react";
import { useClient } from "../hooks/useClient";
import { useParams } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";
import { QRCodeCanvas } from "qrcode.react";
import { BrowserProvider } from "ethers";
import styles from "../styles/Home.module.css";

const CertificatePage = () => {
  const params = useParams();
  const { client } = useClient(); // client is expected to be an ethers.Contract connected to signer or signer-ready
  const { profile } = useProfile();

  const [isLoading, setIsLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [issuerProfile, setIssuerProfile] = useState(null);
  const [txPending, setTxPending] = useState(false);

  const teal200700 = useColorModeValue("teal.200", "teal.700");
  const teal100700 = useColorModeValue("teal.100", "teal.700");

  // helper to normalize the tuple returned by contract.getCertificate
  const parseCertificate = (res) => {
    if (!res) return null;
    return {
      name: res[0],
      issuerAddr: res[1],
      userAddr: res[2],
      uuid: res[3],
      ipfsUrl: res[4],
      isValid: res[5],
    };
  };

  // Invalidate action — only triggered by issuer (button is shown only for issuer)
  const invalidateCertificateAction = async (uuid) => {
    if (!client) {
      alert("Client not initialized");
      return;
    }
    if (!window.ethereum) {
      alert("MetaMask not found");
      return;
    }
    if (!uuid) {
      alert("Certificate id missing");
      return;
    }

    try {
      setTxPending(true);

      // If client is an ethers.Contract instance, connect signer and call
      if (client && typeof client.connect === "function") {
        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contractWithSigner = client.connect(signer);
        const tx = await contractWithSigner.invalidateCertificate(uuid);
        await tx.wait();
      } else if (client && typeof client.invalidateCertificate === "function") {
        // fallback for custom wrapper which may return tx or boolean
        const res = await client.invalidateCertificate(uuid);
        if (res && typeof res.wait === "function") await res.wait();
      } else {
        throw new Error("Client does not support invalidate operation");
      }

      // Re-fetch certificate to update UI
      const fresh = await client.getCertificate(uuid);
      const cert = parseCertificate(fresh);
      setCertificate(cert);

      // refresh profiles (best-effort)
      if (cert?.userAddr) {
        try {
          const u = await client.getProfileByAddress(cert.userAddr);
          setUserProfile({ address: u[0], name: u[1], role: u[2] });
        } catch {}
      }
      if (cert?.issuerAddr) {
        try {
          const i = await client.getProfileByAddress(cert.issuerAddr);
          setIssuerProfile({ address: i[0], name: i[1], role: i[2] });
        } catch {}
      }

      alert("Certificate invalidated (on-chain confirmation received).");
    } catch (err) {
      console.error("Error invalidating certificate:", err);
      if (err?.data?.message) {
        alert("Transaction failed: " + err.data.message);
      } else if (err?.message) {
        alert("Error: " + err.message);
      } else {
        alert("Failed to invalidate certificate — see console for details.");
      }
    } finally {
      setTxPending(false);
    }
  };

  const downloadCertificate = () => {
    if (certificate?.ipfsUrl) window.open(certificate.ipfsUrl, "_blank");
  };

  useEffect(() => {
    if (!client || !params.uuid) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await client.getCertificate(params.uuid);
        const cert = parseCertificate(res);
        console.log("Fetched certificate:", cert);
        console.log("🔍 Debug Addresses:");
console.log("MetaMask account:", acctAddr);
console.log("Issuer of cert:", cert.issuerAddr);
console.log("Student of cert:", cert.userAddr);
console.log("isIssuer:", acctAddr === cert.issuerAddr?.toLowerCase());
console.log("isStudent:", acctAddr === cert.userAddr?.toLowerCase());


        let userRes = null;
        let issuerRes = null;

        if (cert?.userAddr) {
          try {
            const u = await client.getProfileByAddress(cert.userAddr);
            userRes = { address: u[0], name: u[1], role: u[2] };
          } catch {
            console.warn("Unable to fetch user profile for", cert.userAddr);
          }
        } else {
          console.warn("No userAddr in certificate");
        }

        if (cert?.issuerAddr) {
          try {
            const i = await client.getProfileByAddress(cert.issuerAddr);
            issuerRes = { address: i[0], name: i[1], role: i[2] };
          } catch {
            console.warn("Unable to fetch issuer profile for", cert.issuerAddr);
          }
        } else {
          console.warn("No issuerAddr in certificate");
        }

        setCertificate(cert);
        setUserProfile(userRes);
        setIssuerProfile(issuerRes);
      } catch (err) {
        console.error("Error fetching certificate data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [client, params.uuid]);

  // defensive lowercase comparisons
  const acctAddr = profile?.address ? profile.address.toLowerCase() : null;
  const certIssuer = certificate?.issuerAddr ? certificate.issuerAddr.toLowerCase() : null;
  const certUser = certificate?.userAddr ? certificate.userAddr.toLowerCase() : null;

  const isIssuer = acctAddr && certIssuer && acctAddr === certIssuer;
  const isStudent = acctAddr && certUser && acctAddr === certUser;

  return (
    <main className={styles.main}>
      <Container py={{ base: "10", md: "12" }} maxW="6xl">
        <HStack spacing={2} mb={4}>
          <SkeletonCircle size="4" />
          {!isLoading ? (
            <Heading as="h4" size="lg" ml="-2">
              Certificate{" "}
              <Text as="span" color="teal.500">{certificate?.name || "Unnamed"}</Text>{" "}
              for{" "}
              <Text as="span" color="teal.400">{userProfile?.name || certificate?.userAddr}</Text>{" "}
              by{" "}
              <Text as="span" color="teal.600">{issuerProfile?.name || certificate?.issuerAddr}</Text>
            </Heading>
          ) : (
            <Heading as="h4" size="lg" ml="-2">Certificate Page</Heading>
          )}
        </HStack>

        <Divider mt={4} />

        <Box overflowX="auto" mt={4}>
          <Table variant="striped" colorScheme="teal">
            <Tbody>
              <Tr>
                <Th bg={teal200700}>Name of Issuer</Th>
                <Td bg={teal100700}>{issuerProfile?.name || certificate?.issuerAddr || "N/A"}</Td>
              </Tr>
              <Tr>
                <Th bg={teal200700}>Name of Student</Th>
                <Td bg={teal100700}>{userProfile?.name || certificate?.userAddr || "N/A"}</Td>
              </Tr>
              <Tr>
                <Th bg={teal200700}>Issuer Address</Th>
                <Td bg={teal100700}>{certificate?.issuerAddr || "Loading..."}</Td>
              </Tr>
              <Tr>
                <Th bg={teal200700}>Student Address</Th>
                <Td bg={teal100700}>{certificate?.userAddr || "Loading..."}</Td>
              </Tr>

              <Tr>
                <Th bg={teal200700}>IPFS Link</Th>
                <Td bg={teal100700}>
                  {certificate?.ipfsUrl ? (
                    <Button
                      as="a"
                      href={certificate.ipfsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="sm"
                      colorScheme="teal"
                    >
                      View / Download
                    </Button>
                  ) : "Loading..."}
                </Td>
              </Tr>

              <Tr>
                <Th bg={teal200700}>Certificate Status</Th>
                <Td bg={teal100700}>
                  {typeof certificate?.isValid === "boolean" ? (
                    certificate.isValid ? (
                      <Badge colorScheme="green" p={2}>✅ Valid Certificate</Badge>
                    ) : (
                      <Badge colorScheme="red" p={2}>❌ Invalid / Revoked</Badge>
                    )
                  ) : (
                    "Loading..."
                  )}
                </Td>
              </Tr>

              {certificate && (
                <Tr>
                  <Th bg={teal200700}>Action</Th>
                  <Td bg={teal100700}>
                    {isIssuer && certificate.isValid && (
                      <Button
                        colorScheme="red"
                        onClick={() => invalidateCertificateAction(certificate.uuid)}
                        isLoading={txPending}
                        loadingText="Invalidating..."
                      >
                        Invalidate Certificate
                      </Button>
                    )}
                    {isStudent && (
                      <Button ml={2} colorScheme="teal" onClick={downloadCertificate}>
                        Download Certificate
                      </Button>
                    )}
                    {!isIssuer && !isStudent && <Text>View & Verify Only</Text>}
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>

        {!isLoading && certificate && (
          <Center mt={10}>
            <VStack spacing={3}>
              <Text fontWeight="bold" fontSize="lg">🔍 Verify Certificate via QR</Text>
              <QRCodeCanvas
                value={`${window.location.origin}/certificate/${certificate.uuid}`}
                size={180}
                level="H"
              />
              <Text fontSize="sm" color="gray.500">Scan this QR to verify the certificate</Text>
            </VStack>
          </Center>
        )}
      </Container>
    </main>
  );
};

export default CertificatePage;