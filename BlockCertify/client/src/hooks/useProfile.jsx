import React, { useState, useContext, useMemo } from "react";

const profileContext = React.createContext();

export const useProfile = () => {
  return useContext(profileContext);
};

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);

  // Make isRegistered reactive to profile changes
  const isRegistered = useMemo(() => {
    if (!profile) return false;
    return profile.role !== "NA";
  }, [profile]);

  console.debug("profile state changed");
  console.debug({ profile, isRegistered });

  return (
    <profileContext.Provider value={{ profile, setProfile, isRegistered }}>
      {children}
    </profileContext.Provider>
  );
}
