import React from "react";
import {
  Box,
  Flex,
  Text,
  Stack,
  useColorModeValue,
  Container,
  Heading,
} from "@chakra-ui/react";
import DarkModeSwitch from "./DarkModeSwitch";
import { Link } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";

const Navbar = () => {
  const { profile } = useProfile();

  return (
    <Box>
      <Flex
        color={useColorModeValue("gray.600", "white")}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom="1px solid"
        borderColor={useColorModeValue("gray.200", "gray.900")}
        align="center"
        pos="fixed"
        top="0"
        w="full"
        minH="60px"
        boxShadow="sm"
        zIndex="999"
        justify="center"
        css={{
          backdropFilter: "saturate(180%) blur(5px)",
          backgroundColor: useColorModeValue(
            "rgba(255, 255, 255, 0.8)",
            "rgba(26, 32, 44, 0.8)"
          ),
        }}
      >
        <Container as={Flex} maxW="7xl" align="center">
          {/* Logo */}
          <Flex flex={{ base: 1 }} justify="start" ml={{ base: -2, md: 0 }}>
            <Heading
              as="h2"
              size="lg"
              fontFamily="heading"
              textAlign="left"
              color={useColorModeValue("teal.800", "white")}
            >
              <Link to="/">
                <Box
                  as="span"
                  color={useColorModeValue("teal.400", "teal.300")}
                  position="relative"
                  zIndex={10}
                  _after={{
                    content: '""',
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    w: "full",
                    h: "30%",
                    bg: useColorModeValue("teal.100", "teal.900"),
                    zIndex: -1,
                  }}
                >
                  BlockCertify 📑
                </Box>
              </Link>
            </Heading>
          </Flex>

          {/* Desktop actions */}
          <Stack
            flex={{ base: 1, md: 0 }}
            justify="flex-end"
            direction="row"
            spacing={6}
            display={{ base: "none", md: "flex" }}
          >
            {profile && profile.name !== "NA" && (
              <Text fontWeight="medium">{profile.name}</Text>
            )}
            <DarkModeSwitch />
          </Stack>

          {/* Mobile actions */}
          <Flex display={{ base: "flex", md: "none" }}>
            <DarkModeSwitch />
          </Flex>
        </Container>
      </Flex>
    </Box>
  );
};

export default Navbar;
