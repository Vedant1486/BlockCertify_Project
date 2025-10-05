import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMetamask } from "../hooks/useMetamask"; // ✅ Named export
import EtherDocsClient from "../lib/EtherDocsClient";


export default function Index() {
  const navigate = useNavigate();
  const { provider, account } = useMetamask();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!provider || !account) return;

      try {
        const client = new EtherDocsClient(provider.getSigner());

        const isIssuer = await client.isIssuer();
        const isStudent = await client.isStudent();

        if (isIssuer) {
          navigate("/is-registered/issuer");
          return;
        }

        if (isStudent) {
          navigate("/is-registered/student");
          return;
        }

        // Not registered → redirect to registration page
        navigate("/is-not-registered/issuer");
      } catch (error) {
        console.error("Error checking user role:", error);
      }
    };

    checkUserRole();
  }, [provider, account, navigate]);

  return (
    <div className="flex justify-center items-center h-screen text-white">
      <h1 className="text-2xl">Loading...</h1>
    </div>
  );
}
