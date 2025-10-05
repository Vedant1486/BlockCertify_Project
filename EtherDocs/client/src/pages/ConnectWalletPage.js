import React, { useEffect } from "react";
import {
  Heading,
  Text,
  Container,
  Button,
  useColorModeValue,
  useBreakpointValue,
  Stack,
  Box,
  SimpleGrid,
  Icon
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useMetamask } from "../hooks/useMetamask";
import { FaLock, FaCertificate, FaEthereum } from "react-icons/fa";

const ConnectWalletPage = () => {
  const navigate = useNavigate();
  const { connect, isConnected } = useMetamask();

  // ✅ Call hooks only once at top
  const cardBg = useColorModeValue("white", "gray.700");
  const cardHoverBg = useColorModeValue("gray.50", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const subTextColor = useColorModeValue("gray.500", "gray.400");
  const headingColor = useColorModeValue("gray.800", "white");

  // Redirect to NotRegisteredUserPage once wallet is connected
  useEffect(() => {
    if (isConnected) {
      navigate("/is-not-registered");
    }
  }, [isConnected, navigate]);

  const features = [
    {
      icon: FaLock,
      title: "🔒 Secure & Tamper-proof",
      text: "Blockchain ensures documents cannot be altered or faked."
    },
    {
      icon: FaCertificate,
      title: "📜 Verified Certificates",
      text: "Instantly verify student certificates from anywhere in the world."
    },
    {
      icon: FaEthereum,
      title: "⚡ Ethereum Powered",
      text: "Built on Ethereum for transparency and decentralized trust."
    }
  ];

  return (
    <Container maxW="7xl" py={{ base: 8, md: 16 }}>
      {/* Heading Section */}
      <Stack spacing={6} textAlign="center" mb={10}>
        <Heading
          fontSize={useBreakpointValue({ base: "3xl", md: "5xl" })}
          fontWeight="bold"
          fontFamily="heading"
          color={headingColor}
          lineHeight="shorter"
        >
          🎓 Manage Student Documents <br />
          <Text
            as="span"
            bgGradient="linear(to-r, teal.400, teal.600)"
            bgClip="text"
          >
            on the Blockchain
          </Text>{" "}
          ✨
        </Heading>
        <Text
          fontSize={{ base: "md", md: "lg" }}
          color={textColor}
          maxW="3xl"
          mx="auto"
        >
          A secure and transparent way to register students, issue certificates,
          and verify records — powered by Ethereum blockchain.
        </Text>
      </Stack>

      {/* Features Section */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} mb={14}>
        {features.map((feature, i) => (
          <Box
            key={i}
            bg={cardBg}
            p={6}
            rounded="2xl"
            shadow="xl"
            textAlign="center"
            transition="all 0.3s"
            _hover={{
              transform: "translateY(-6px)",
              shadow: "2xl",
              bg: cardHoverBg
            }}
          >
            <Icon as={feature.icon} w={10} h={10} color="teal.400" mb={4} />
            <Heading fontSize="xl" mb={2}>
              {feature.title}
            </Heading>
            <Text color={textColor}>{feature.text}</Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* Call to Action */}
      <Stack align="center">
        <Button
          fontSize="lg"
          fontWeight={600}
          color="white"
          bgGradient="linear(to-r, teal.400, teal.600)"
          _hover={{ bgGradient: "linear(to-r, teal.500, teal.700)" }}
          size="lg"
          px={10}
          py={6}
          rounded="full"
          shadow="lg"
          onClick={connect} // opens Metamask
        >
          🚀 Connect Your Wallet
        </Button>
        <Text mt={3} fontSize="sm" color={subTextColor}>
          Start your journey with decentralized student document management.
        </Text>
      </Stack>
    </Container>
  );
};

export default ConnectWalletPage;
