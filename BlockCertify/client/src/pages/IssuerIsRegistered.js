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
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Home.module.css";
import { useClient } from "../hooks/useClient";

const IssuerIsRegistered = () => {
  const { client } = useClient();
  const [certificates, setCertificates] = useState([]);
  const [certiCount, setCertiCount] = useState(0);
  const navigate = useNavigate();

  const tableHeadBg = useColorModeValue("teal.200", "teal.700");
  const tableBodyBg = useColorModeValue("teal.50", "gray.700");
  const tableRowHoverBg = useColorModeValue("teal.100", "gray.600");

  const parseCertificate = (res) => ({
    name: res[0],
    issuerAddr: res[1],
    userAddr: res[2],
    uuid: res[3],
    ipfsUrl: res[4],
    isValid: res[5],
  });

  useEffect(() => {
    async function load() {
      if (!client) return;

      const ids = await client.getCertificatesIssuedBy();
      const list = [];

      for (let uuid of ids) {
        const r = await client.getCertificate(uuid);
        list.push(parseCertificate(r));
      }

      setCertificates(list);
      setCertiCount(list.length);
    }
    load();
  }, [client]);

  return (
    <main className={styles.main}>
      <Container py="10" maxW="7xl">
        <HStack spacing={2}>
          <SkeletonCircle size="4" />
          <Heading as="h4" fontSize="2xl">You have issued {certiCount} Certificates</Heading>
        </HStack>

        <Divider mt="4" />

        <Box my={5}>
          <Link to="/issuer/new-certificate">
            <Button colorScheme="teal" size="lg">Issue New Certificate</Button>
          </Link>
        </Box>

        <Box overflowX="auto" mt={6}>
          <Table size="lg">
            <Thead bg={tableHeadBg}>
              <Tr>
                <Th>Name</Th>
                <Th>UUID</Th>
                <Th>Issued To</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>

            <Tbody bg={tableBodyBg}>
              {certificates.map((cert, i) => (
                <Tr key={cert.uuid + "_" + i} _hover={{ bg: tableRowHoverBg }}>
                  <Td>{cert.name}</Td>
                  <Td>{cert.uuid}</Td>
                  <Td>{cert.userAddr}</Td>
                  <Td>
                    <Button
                      colorScheme="teal"
                      onClick={() => navigate("/certificate/" + cert.uuid)}
                    >
                      View
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

export default IssuerIsRegistered;