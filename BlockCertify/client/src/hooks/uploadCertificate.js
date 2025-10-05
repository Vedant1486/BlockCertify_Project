import ipfs from "./ipfs";

export const uploadCertificate = async (file) => {
  try {
    const added = await ipfs.add(file);
    console.log("IPFS Hash:", added.path);
    return added.path; // This is the hash to store on-chain
  } catch (err) {
    console.error("IPFS upload error:", err);
    throw err;
  }
};
