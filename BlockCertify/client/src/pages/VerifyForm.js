import React, { useState, useRef } from "react";
import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertDescription,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import FileUpload from "../components/FileUpload";
import axios from "axios";
import { useMetamask } from "../hooks/useMetamask";
import { useClient } from "../hooks/useClient";

const VerifyForm = () => {
  const { client } = useClient();
  const [error, setError] = useState("");
  const {
    handleSubmit,
    register,
    control,
    formState: { isSubmitting, errors },
  } = useForm({
    mode: "onChange",
  });
  const { isConnected } = useMetamask();
  const inputRef = useRef();
  const toast = useToast();

  async function onSubmit(data) {
    try {
      if (!inputRef.current?.files?.[0]) {
        setError("Please upload a file.");
        return;
      }
      setError(""); // clear old errors

      // 🔹 Send file to backend for hashing
      const formData = new FormData();
      formData.append("certificate", inputRef.current.files[0]);

      const response = await axios.post(
        "http://localhost:5000/calculatehash",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // ✅ Normalize everything before sending to contract
      const hash = response.data.hash.trim().toLowerCase();
      const issuedBy = data.Issued_by.trim().toLowerCase();
      const issuedTo = data.Issued_to.trim().toLowerCase();
      const uuid = data.UUID.trim();

      console.log("Form Data:", { issuedBy, issuedTo, uuid }, "Hash:", hash);

      // 🔹 Call smart contract (read-only)
      const res = await client.verifyCertificate(uuid, issuedBy, issuedTo, hash);

      console.log("Verify raw result:", res);

      // ✅ ethers.js already returns a boolean
      const isValid = res === true;

      if (isValid) {
        toast({
          title: "✅ Document Is Authentic",
          variant: "left-accent",
          position: "bottom-right",
          duration: 8000,
          status: "success",
          isClosable: true,
        });
      } else {
        toast({
          title: "❌ Document Is Not Authentic",
          variant: "left-accent",
          position: "bottom-right",
          duration: 8000,
          status: "error",
          isClosable: true,
        });
      }
    } catch (err) {
      console.error("Verification Error:", err);
      setError("Verification failed. Please check backend or contract.");
    }
  }

  return (
    <>
      <main>
        <Stack spacing={8} mx={"auto"} maxW={"2xl"} py={12} px={6} my={20}>
          <Text fontSize={"lg"} color={"teal.400"}>
            <ArrowBackIcon mr={2} />
            <Link to="/is-not-registered">Back to Home</Link>
          </Text>

          <Stack>
            <Heading fontSize={"4xl"}>Verify a document 📃</Heading>
          </Stack>

          <Box
            rounded={"lg"}
            bg={useColorModeValue("white", "gray.700")}
            boxShadow={"lg"}
            p={8}
          >
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                <FormControl id="Issued_by" isRequired>
                  <FormLabel>Issuer Wallet Address</FormLabel>
                  <Input
                    {...register("Issued_by", { required: true })}
                    isDisabled={isSubmitting}
                  />
                </FormControl>

                <FormControl id="Issued_to" isRequired>
                  <FormLabel>Student's Wallet Address</FormLabel>
                  <Input
                    {...register("Issued_to", { required: true })}
                    isDisabled={isSubmitting}
                  />
                </FormControl>

                <FormControl id="UUID" isRequired>
                  <FormLabel>UUID</FormLabel>
                  <Input
                    {...register("UUID", { required: true })}
                    isDisabled={isSubmitting}
                  />
                </FormControl>

                <FormControl id="target" isRequired>
                  <FormLabel>File Upload</FormLabel>
                  <FileUpload
                    name="PDF format"
                    acceptedFileTypes="application/pdf"
                    isRequired={true}
                    placeholder="file_name.pdf"
                    control={control}
                    inputRef={inputRef}
                  >
                    Only PDF format is acceptable
                  </FileUpload>
                </FormControl>

                {error && (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription mr={2}>{error}</AlertDescription>
                  </Alert>
                )}

                {Object.keys(errors).length > 0 && (
                  <Alert status="error">
                    <AlertIcon />
                    <AlertDescription mr={2}>
                      All Fields are Required
                    </AlertDescription>
                  </Alert>
                )}

                <Stack spacing={10}>
                  <Stack spacing={3}>
                    {isConnected ? (
                      <Button
                        color={"white"}
                        bg={"teal.400"}
                        _hover={{ bg: "teal.300" }}
                        type="submit"
                        isLoading={isSubmitting}
                      >
                        Submit
                      </Button>
                    ) : (
                      <Alert status="warning">
                        <AlertIcon />
                        <AlertDescription mr={2}>
                          Please Connect Your Wallet to Register
                        </AlertDescription>
                      </Alert>
                    )}
                  </Stack>
                </Stack>
              </Stack>
            </form>
          </Box>
        </Stack>
      </main>
    </>
  );
};

export default VerifyForm;
