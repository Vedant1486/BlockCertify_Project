import React, { useState } from "react";
import {
  Stack,
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMetamask } from "../hooks/useMetamask";
import { useClient } from "../hooks/useClient";
import { useProfile } from "../hooks/useProfile";

const IssuerForm = () => {
  const { client } = useClient();
  const { setProfile } = useProfile();
  const {
    handleSubmit,
    register,
    formState: { isSubmitting, errors },
  } = useForm({ mode: "onChange" });

  const [error, setError] = useState("");
  const { isConnected } = useMetamask();
  const navigate = useNavigate();

  async function onSubmit(data) {
    try {
      if (!client) {
        setError("Blockchain client is not ready. Please reconnect your wallet.");
        return;
      }

      console.log("📨 Registering issuer:", data.issuer_name);

      // Call contract
      const tx = await client.registerIssuer(data.issuer_name);

      if (tx && tx.wait) {
        console.log("⏳ Waiting for transaction confirmation...");
        await tx.wait();
      }

      console.log("✅ Issuer registered successfully");

      // Refresh profile after registration
      const updatedProfile = await client.getProfile();
      setProfile(updatedProfile);

      navigate("/is-registered/issuer");
    } catch (err) {
      console.error("❌ Registration error:", err);
      setError(err.message || "An error occurred during issuer registration.");
    }
  }

  return (
    <main>
      <Stack spacing={8} mx={"auto"} maxW={"2xl"} py={12} px={6} my={20}>
        <Text fontSize={"lg"} color={"teal.400"}>
          <ArrowBackIcon mr={2} />
          <Link to="/is-not-registered">Back to Home</Link>
        </Text>

        <Stack>
          <Heading fontSize={"4xl"}>Register as an Issuer 🏢</Heading>
        </Stack>

        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <FormControl id="issuer_name">
                <FormLabel>Issuer Name</FormLabel>
                <Input
                  {...register("issuer_name", { required: true })}
                  isDisabled={isSubmitting}
                />
              </FormControl>

              {error && (
                <Alert status="error">
                  <AlertIcon />
                  <AlertDescription mr={2}>{error}</AlertDescription>
                </Alert>
              )}

              {errors.issuer_name && (
                <Alert status="error">
                  <AlertIcon />
                  <AlertDescription mr={2}>
                    Issuer Name is required
                  </AlertDescription>
                </Alert>
              )}

              <Stack spacing={10}>
                {isConnected ? (
                  <Stack spacing={3}>
                    <Button
                      color={"white"}
                      bg={"teal.400"}
                      _hover={{ bg: "teal.300" }}
                      type="submit"
                      isLoading={isSubmitting}
                    >
                      Submit
                    </Button>
                  </Stack>
                ) : (
                  <Alert status="warning">
                    <AlertIcon />
                    <AlertDescription mr={2}>
                      Please Connect Your Wallet First to Register
                    </AlertDescription>
                  </Alert>
                )}
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </main>
  );
};

export default IssuerForm;
