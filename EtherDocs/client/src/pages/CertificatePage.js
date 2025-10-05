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
import styles from "../styles/Home.module.css";

const CertificatePage = () => {
  const params = useParams();
  const { client } = useClient();
  const { profile } = useProfile();

  const [isLoading, setIsLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [issuerProfile, setIssuerProfile] = useState(null);

  const teal200700 = useColorModeValue("teal.200", "teal.700");
  const teal100700 = useColorModeValue("teal.100", "teal.700");

  const invalidateCertificateAction = async (uuid) => {
    try {
      await client.invalidateCertificate(uuid);
      const res = await client.getCertificate(uuid);
      setCertificate(res);
    } catch (err) {
      console.error("Error invalidating certificate:", err);
    }
  };

  const downloadCertificate = () => {
    if (certificate?.ipfsUrl) {
      window.open(certificate.ipfsUrl, "_blank");
    }
  };

  useEffect(() => {
    if (!client || !params.uuid) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const certRes = await client.getCertificate(params.uuid);
        if (!certRes) throw new Error("Certificate not found");

        console.log("Fetched certificate:", certRes);

        let userRes = null;
        let issuerRes = null;

        // Fetch user profile only if userAddr exists
        if (certRes.userAddr) {
          try {
            userRes = await client.getProfileByAddress(certRes.userAddr);
          } catch {
            console.warn("Unable to fetch user profile");
          }
        } else {
          console.warn("No userAddr in certificate");
        }

        // Fetch issuer profile only if issuerAddr exists
        if (certRes.issuerAddr) {
          try {
            issuerRes = await client.getProfileByAddress(certRes.issuerAddr);
          } catch {
            console.warn("Unable to fetch issuer profile");
          }
        } else {
          console.warn("No issuerAddr in certificate");
        }

        setCertificate(certRes);
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

  const isIssuer = profile?.address?.toLowerCase() === certificate?.issuerAddr?.toLowerCase();
  const isStudent = profile?.address?.toLowerCase() === certificate?.userAddr?.toLowerCase();

  return (
    <main className={styles.main}>
      <Container py={{ base: "10", md: "12" }} maxW="6xl">
        {/* Header */}
        <HStack spacing={2} mb={4}>
          <SkeletonCircle size="4" />
          {!isLoading ? (
            <Heading as="h4" size="lg" ml="-2">
              Certificate{" "}
              <Text as="span" color="teal.500">{certificate?.name || "Unnamed"}</Text>{" "}
              for <Text as="span" color="teal.400">{userProfile?.name || certificate?.userAddr}</Text> by{" "}
              <Text as="span" color="teal.600">{issuerProfile?.name || certificate?.issuerAddr}</Text>
            </Heading>
          ) : (
            <Heading as="h4" size="lg" ml="-2">Certificate Page</Heading>
          )}
        </HStack>

        <Divider mt={4} />

        {/* Certificate Details Table */}
        <Box overflowX="auto" mt={4}>
          <Table variant="striped" colorScheme="teal">
            <Tbody>
              <Tr>
                <Th bg={teal200700}>Name of Issuer</Th>
                <Td bg={teal100700} opacity="0.9">
                  {isLoading ? "Loading..." : issuerProfile?.name || certificate?.issuerAddr || "N/A"}
                </Td>
              </Tr>
              <Tr>
                <Th bg={teal200700}>Name of Student</Th>
                <Td bg={teal100700} opacity="0.9">
                  {isLoading ? "Loading..." : userProfile?.name || certificate?.userAddr || "N/A"}
                </Td>
              </Tr>
              <Tr>
                <Th bg={teal200700}>Issuer Address</Th>
                <Td bg={teal100700} opacity="0.9">{certificate?.issuerAddr || "Loading..."}</Td>
              </Tr>
              <Tr>
                <Th bg={teal200700}>Student Address</Th>
                <Td bg={teal100700} opacity="0.9">{certificate?.userAddr || "Loading..."}</Td>
              </Tr>
              <Tr>
                <Th bg={teal200700}>IPFS Link</Th>
                <Td bg={teal100700} opacity="0.9">
                  {certificate?.ipfsUrl ? (
                    <Button as="a" href={certificate.ipfsUrl} target="_blank" rel="noopener noreferrer" size="sm" colorScheme="teal">
                      View / Download
                    </Button>
                  ) : "Loading..."}
                </Td>
              </Tr>
              <Tr>
                <Th bg={teal200700}>Certificate Status</Th>
                <Td bg={teal100700} opacity="0.9">
                  {certificate ? (
                    certificate.isValid ? (
                      <Badge colorScheme="green" p={2} borderRadius="md">✅ Valid Certificate</Badge>
                    ) : (
                      <Badge colorScheme="red" p={2} borderRadius="md">❌ Invalid / Revoked</Badge>
                    )
                  ) : "Loading..."}
                </Td>
              </Tr>

              {/* Role-based Actions */}
              {certificate?.isValid && !isLoading && (
                <Tr>
                  <Th bg={teal200700}>Action</Th>
                  <Td bg={teal100700} opacity="0.9">
                    {isIssuer && (
                      <Button colorScheme="red" onClick={() => invalidateCertificateAction(certificate.uuid)}>
                        Invalidate Certificate
                      </Button>
                    )}
                    {isStudent && (
                      <Button colorScheme="teal" ml={2} onClick={downloadCertificate}>
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

        {/* QR Code */}
        {!isLoading && certificate && (
          <Center mt={10}>
            <VStack spacing={3}>
              <Text fontWeight="bold" fontSize="lg">🔍 Verify Certificate via QR</Text>
              <QRCodeCanvas
                value={`${window.location.origin}/certificate/${certificate.uuid}`}
                size={180}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
                includeMargin={true}
              />
              <Text fontSize="sm" color="gray.500">Scan this QR code to verify the certificate</Text>
            </VStack>
          </Center>
        )}
      </Container>
    </main>
  );
};

export default CertificatePage;
