import React, { useState, useRef } from "react";
import {
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
  FormHelperText,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import FileUpload from "../components/FileUpload";
import { useMetamask } from "../hooks/useMetamask";
import axios from "axios";
import { useClient } from "../hooks/useClient";

const IssuerForm = () => {
  const {
    handleSubmit,
    register,
    control,
    formState: { isSubmitting, errors },
  } = useForm({
    mode: "onChange",
  });

  const inputRef = useRef();
  const [error, setError] = useState("");
  const { isConnected } = useMetamask();
  const navigate = useNavigate();
  const { client } = useClient();

  async function onSubmit(data) {
    try {
      if (!inputRef.current?.files[0]) {
        setError("Please upload a certificate file.");
        return;
      }
      setError(""); // clear old errors

      // Prepare file for backend
      const formData = new FormData();
      formData.append("certificate", inputRef.current.files[0]);

      const response = await axios.post("http://localhost:5000/issue", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("📝 Backend response:", response.data);

      // Blockchain transaction
      const success = await client.issueCertificate(
        data.certificate_name,
        data.new_address,
        response.data.uuid,
        response.data.hash,
        response.data.ipfsLink
      );

      if (success) {
        console.log("✅ Certificate issued, navigating...");
        navigate("/is-registered/issuer", { replace: true });
      } else {
        setError("❌ Failed to issue certificate on blockchain");
      }
    } catch (err) {
      console.error("Error issuing certificate:", err);
      setError("Something went wrong while issuing the certificate");
    }
  }

  return (
    <main>
      <Stack spacing={8} mx={"auto"} maxW={"2xl"} py={12} px={6} my={20}>
        <Text fontSize={"lg"} color={"teal.400"}>
          <ArrowBackIcon mr={2} />
          <Link to="/is-registered/issuer">Go Back</Link>
        </Text>

        <Stack>
          <Heading fontSize={"4xl"}>Issue a new certificate</Heading>
        </Stack>

        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <FormControl id="certificate_name" isRequired>
                <FormLabel>Certificate Name</FormLabel>
                <Input
                  {...register("certificate_name", { required: true })}
                  isDisabled={isSubmitting}
                />
              </FormControl>

              <FormControl id="new_name" isRequired>
                <FormLabel>Student Name</FormLabel>
                <Input
                  {...register("new_name", { required: true })}
                  isDisabled={isSubmitting}
                />
              </FormControl>

              <FormControl id="new_address" isRequired>
                <FormLabel>Ethereum Address</FormLabel>
                <Input
                  {...register("new_address", {
                    required: "Ethereum address is required",
                    validate: (value) =>
                      /^0x[a-fA-F0-9]{40}$/.test(value) ||
                      "Invalid Ethereum address",
                  })}
                  isDisabled={isSubmitting}
                />
                {errors.new_address && (
                  <FormHelperText color="red.400">
                    {errors.new_address.message}
                  </FormHelperText>
                )}
              </FormControl>

              <FormControl id="doc" isRequired>
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
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {(errors.certificate_name ||
                errors.new_name ||
                errors.new_address) && (
                <Alert status="error">
                  <AlertIcon />
                  <AlertDescription>
                    All required fields must be filled correctly
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
                      <AlertDescription>
                        Please Connect Your Wallet First to Register
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
  );
};

export default IssuerForm;
