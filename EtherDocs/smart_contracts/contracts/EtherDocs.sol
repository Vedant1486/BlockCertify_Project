// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EtherDocs {
    struct Profile {
        address userAddress;
        string name;
        string role; // "User" or "Issuer"
    }

    struct Certificate {
        string name;
        address issuerAddr;
        address userAddr;
        string uuid;
        string ipfsUrl;
        bool isValid;
        string hashValue;
    }

    mapping(address => Profile) private profiles;
    mapping(string => Certificate) private certificates;
    mapping(address => string[]) private issuedCertificates;
    mapping(address => string[]) private receivedCertificates;

    // ===== PROFILE FUNCTIONS =====
    function registerUser(string calldata name) external {
        profiles[msg.sender] = Profile(msg.sender, name, "User");
    }

    function registerIssuer(string calldata name) external {
        profiles[msg.sender] = Profile(msg.sender, name, "Issuer");
    }

    function isRegistered() external view returns (bool) {
        return bytes(profiles[msg.sender].role).length > 0;
    }

    function isUser() external view returns (bool) {
        return keccak256(bytes(profiles[msg.sender].role)) == keccak256(bytes("User"));
    }

    function isIssuer() external view returns (bool) {
        return keccak256(bytes(profiles[msg.sender].role)) == keccak256(bytes("Issuer"));
    }

    function getProfile() external view returns (address, string memory, string memory) {
        Profile memory p = profiles[msg.sender];
        require(bytes(p.role).length > 0, "User not registered");
        return (p.userAddress, p.name, p.role);
    }

    function getProfileByAddress(address user) external view returns (address, string memory, string memory) {
        Profile memory p = profiles[user];
        require(bytes(p.role).length > 0, "User not registered");
        return (p.userAddress, p.name, p.role);
    }

    // ===== CERTIFICATE FUNCTIONS =====
    function issueCertificate(
        string calldata name,
        address userAddr,
        string calldata uuid,
        string calldata hashValue,
        string calldata ipfsUrl
    ) external {
        require(isIssuerAddress(msg.sender), "Only issuers can issue certificates");
        certificates[uuid] = Certificate(name, msg.sender, userAddr, uuid, ipfsUrl, true, hashValue);
        issuedCertificates[msg.sender].push(uuid);
        receivedCertificates[userAddr].push(uuid);
    }

    function invalidateCertificate(string calldata uuid) external {
        Certificate storage cert = certificates[uuid];
        require(cert.issuerAddr == msg.sender, "Only issuer can invalidate");
        cert.isValid = false;
    }

    function getCertificate(string calldata uuid) external view returns (
        string memory, address, address, string memory, string memory, bool
    ) {
        Certificate memory cert = certificates[uuid];
        return (cert.name, cert.issuerAddr, cert.userAddr, cert.uuid, cert.ipfsUrl, cert.isValid);
    }

    function verifyCertificate(
        string calldata uuid,
        address issuerAddr,
        address userAddr,
        string calldata hashValue
    ) external view returns (bool) {
        Certificate memory cert = certificates[uuid];
        return cert.isValid &&
               cert.issuerAddr == issuerAddr &&
               cert.userAddr == userAddr &&
               keccak256(bytes(cert.hashValue)) == keccak256(bytes(hashValue));
    }

    function getCertificatesIssuedFor() external view returns (string[] memory) {
        return receivedCertificates[msg.sender];
    }

    function getCertificatesIssuedBy() external view returns (string[] memory) {
        return issuedCertificates[msg.sender];
    }

    // ===== INTERNAL HELPERS =====
    function isIssuerAddress(address addr) internal view returns (bool) {
        return keccak256(bytes(profiles[addr].role)) == keccak256(bytes("Issuer"));
    }
}
