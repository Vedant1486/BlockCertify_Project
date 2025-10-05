import React, { useState, useEffect } from "react";
import {
  Heading,
  Container,
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  SkeletonCircle,
  Divider,
  useColorModeValue,
  Button,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Home.module.css";
import { useClient } from "../hooks/useClient";

const StudentIsRegistered = () => {
  const { client } = useClient();
  const [certiCount, setCertiCount] = useState(0);
  const [certificates, setCertificates] = useState([]);
  const navigate = useNavigate();

  // ✅ Color mode values (hooks must be at top)
  const tableHeadBg = useColorModeValue("teal.200", "teal.700");
  const tableBodyBg = useColorModeValue("teal.50", "gray.700");
  const tableRowHoverBg = useColorModeValue("teal.100", "gray.600");

  useEffect(() => {
    async function fn() {
      if (client) {
        let res = await client.getCertificatesIssuedFor();
        setCertificates(res);
        setCertiCount(res.length);
      }
    }
    fn();
  }, [client]);

  return (
    <main className={styles.main}>
      <Container py={{ base: "10", md: "12" }} maxW={"7xl"}>
        {/* Header */}
        <HStack spacing={2}>
          <SkeletonCircle size="4" />
          <Heading as="h4" fontSize="2xl" textAlign="left" ml="-2">
            Found {certiCount} Certificates
          </Heading>
        </HStack>

        <Divider marginTop="4" />

        {/* Table */}
        <Box overflowX="auto" mt={6}>
          <Table size="lg">
            <Thead bg={tableHeadBg}>
              <Tr>
                <Th fontSize="lg">Name</Th>
                <Th fontSize="lg">UUID</Th>
                <Th fontSize="lg">Issued By</Th>
                <Th fontSize="lg">Actions</Th>
              </Tr>
            </Thead>
            <Tbody bg={tableBodyBg} opacity="0.95">
              {certificates.map((cert) => (
                <Tr
                  key={cert.uuid}
                  _hover={{ bg: tableRowHoverBg, transition: "0.2s" }}
                >
                  <Td fontSize="md" fontWeight="medium">
                    {cert.name}
                  </Td>
                  <Td fontSize="sm" fontFamily="mono">
                    {cert.uuid}
                  </Td>
                  <Td fontSize="md">{cert.issuerAddr}</Td>
                  <Td>
                    <Button
                      size="md"
                      colorScheme="teal"
                      onClick={() => navigate("/certificate/" + cert.uuid)}
                    >
                      View Certificate
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </Container>
    </main>
  );
};

export default StudentIsRegistered;
