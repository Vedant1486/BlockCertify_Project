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
  const [certificates, setCertificates] = useState([]);
  const [count, setCount] = useState(0);
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

      const ids = await client.getCertificatesIssuedFor();
      const list = [];

      for (let uuid of ids) {
        const r = await client.getCertificate(uuid);
        list.push(parseCertificate(r));
      }

      setCertificates(list);
      setCount(list.length);
    }
    load();
  }, [client]);

  return (
    <main className={styles.main}>
      <Container py="10" maxW="7xl">
        <HStack spacing={2}>
          <SkeletonCircle size="4" />
          <Heading fontSize="2xl">Found {count} Certificates</Heading>
        </HStack>

        <Divider mt={4} />

        <Box overflowX="auto" mt={6}>
          <Table size="lg">
            <Thead bg={tableHeadBg}>
              <Tr>
                <Th>Name</Th>
                <Th>UUID</Th>
                <Th>Issued By</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>

            <Tbody bg={tableBodyBg}>
              {certificates.map((cert) => (
                <Tr key={cert.uuid} _hover={{ bg: tableRowHoverBg }}>
                  <Td>{cert.name}</Td>
                  <Td>{cert.uuid}</Td>
                  <Td>{cert.issuerAddr}</Td>
                  <Td>
                    <Button
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