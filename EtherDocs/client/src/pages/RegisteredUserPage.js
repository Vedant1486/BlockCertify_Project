import React, { useEffect } from 'react';
import FeatureBox from '../components/FeatureBox';
import {
  Heading,
  useBreakpointValue,
  useColorModeValue,
  Button,
  Container,
  SimpleGrid,
  Divider,
  Icon,
  SkeletonCircle,
  HStack,
} from "@chakra-ui/react";
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import styles from '../styles/Home.module.css';
import data from '../RegisteredData';
import { useProfile } from '../hooks/useProfile';

const RegisteredUserPage = () => {
  const { profile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (!profile) {
      // No profile → user not registered
      navigate("/is-not-registered/issuer");
      return;
    }

    if (profile.role === "User") {
      navigate("/is-registered/student");
    } else if (profile.role === "Issuer") {
      navigate("/is-registered/issuer");
    } else {
      navigate("/is-not-registered/issuer");
    }
  }, [profile, navigate]);

  return (
    <div>
      <main className={styles.main}>
        <Container py={{ base: "4", md: "12" }} maxW={"7xl"}>
          <HStack spacing={2}>
            <SkeletonCircle size="4" />
            <Heading as="h2" size="lg">
              Welcome back!
            </Heading>
          </HStack>

          <Divider marginTop="4" />

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10} py={8}>
            {data.map((fund) => (
              <div key={fund.id}>
                <Card
                  name={fund.name}
                  desc={fund.desc}
                  imageURL={fund.imageURL}
                  id={fund.id}
                  path="is-registered"
                  ethPrice="NA"
                />
              </div>
            ))}
          </SimpleGrid>
        </Container>
      </main>
    </div>
  );
};

export default RegisteredUserPage;
