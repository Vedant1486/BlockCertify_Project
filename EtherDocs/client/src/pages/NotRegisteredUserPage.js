import React from "react";
import {
  Heading,
  Container,
  SimpleGrid,
  Divider,
  SkeletonCircle,
  HStack,
  Text,
  Box,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import Card from "../components/Card";
import styles from "../styles/Home.module.css";
import data from "../UnRegisteredData";

// Motion wrapper for Chakra Box
const MotionBox = motion(Box);

const NotRegisteredUserPage = () => {
  return (
    <main className={styles.main}>
      <Container pt="2" pb={{ base: "6", md: "10" }} maxW="7xl">
        <HStack spacing={2} mb={1}>
          <SkeletonCircle size="4" />
          <Heading as="h2" size="lg" m="0">
            Register as
          </Heading>
        </HStack>

        <Text fontSize="md" color="gray.400" mb={2}>
          Choose your role to continue with registration
        </Text>

        <Divider marginTop="2" />

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} py={6}>
          {data.map((option, index) => (
            <MotionBox
              key={option.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, boxShadow: "0px 8px 25px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.98 }}
              borderRadius="2xl"
            >
              <Card
                name={option.name}
                desc={option.desc}
                imageURL={option.imageURL}
                id={option.id}
                path={`/is-not-registered/${option.id}`}
                ethPrice="NA"
              />
            </MotionBox>
          ))}
        </SimpleGrid>
      </Container>
    </main>
  );
};

export default NotRegisteredUserPage;
