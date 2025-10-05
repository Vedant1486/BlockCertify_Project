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

const StudentForm = () => {
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

      console.log("📨 Registering student:", data.student_name);

      // ✅ client already handles tx.wait()
      await client.registerUser(data.student_name);

      console.log("✅ Student registered successfully");

      // ✅ Refresh profile after registration
      const updatedProfile = await client.getProfile();
      if (updatedProfile) {
        setProfile(updatedProfile);
      }

      navigate("/is-registered/student");
    } catch (err) {
      console.error("❌ Registration error:", err);
      setError(err.message || "An error occurred during registration.");
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
          <Heading fontSize={"4xl"}>Register as a Student 👨‍🎓👩‍🎓</Heading>
        </Stack>

        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <FormControl id="student_name">
                <FormLabel>Name</FormLabel>
                <Input
                  {...register("student_name", { required: true })}
                  isDisabled={isSubmitting}
                />
              </FormControl>

              {error && (
                <Alert status="error">
                  <AlertIcon />
                  <AlertDescription mr={2}>{error}</AlertDescription>
                </Alert>
              )}

              {errors.student_name && (
                <Alert status="error">
                  <AlertIcon />
                  <AlertDescription mr={2}>
                    All Fields are Required
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

export default StudentForm;
