BlockCertify – Decentralized Certificate Verification System

BlockCertify is a decentralized web application built on Ethereum that allows institutions to issue blockchain‑based certificates and enables users to verify their authenticity. The project ensures transparency, tamper‑proof storage, and instant verification using smart contracts and IPFS.

🚀 Features
🔐 Blockchain-Based Certificate Storage

Certificates are hashed and stored securely on the Ethereum blockchain.

Prevents tampering, duplication, or modification.

📂 IPFS File Handling

Actual certificate files (PDF/Images) are uploaded to IPFS.

Only the IPFS hash is stored on the smart contract for authenticity.

👨‍🎓 User Profiles

Every user has a profile containing:

Name

Email

IPFS Hash (Profile Document)

Managed through the EtherDocs smart contract.

🖥️ Frontend Interface

React-based UI for:

Uploading certificates

Viewing and verifying certificates

Managing profiles

Checking blockchain transaction status

🧾 Admin Panel

Admin/institutes can:

Issue certificates

Invalidate certificates

View issued certificate list

📁 Project Structure
BlockCertify
│── client/           # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/  # ClientProvider, Contract connection
│   │   ├── abi.json
│   │   └── App.js
│── contracts/        # Solidity Smart Contracts
│   ├── BlockCertify.sol
│   └── EtherDocs.sol
│── scripts/
│── test/
│── hardhat.config.js

⚙️ Tech Stack
🛠 Backend / Blockchain

Solidity

Hardhat

Ethereum / MetaMask

Ethers.js

IPFS / Pinata

🎨 Frontend

React

JavaScript

Bootstrap / Custom CSS

🧩 Smart Contract Functions (EtherDocs)
📌 Mapping
mapping(address => Profile) public profiles;

📌 Functions
function getProfile() public view returns (string memory, string memory, string memory);

function setProfile(string memory _name, string memory _email, string memory _ipfsHash) public;

📦 Installation & Setup
1️⃣ Clone the repo
git clone https://github.com/Vedant1486/BlockCertify_Project.git
cd BlockCertify_Project

2️⃣ Install dependencies
npm install
cd client
npm install

3️⃣ Start Hardhat node
npx hardhat node

4️⃣ Deploy smart contract
npx hardhat run scripts/deploy.js --network localhost

5️⃣ Run the frontend
cd client
npm start

🗳️ How It Works

Student/Institute uploads certificate → stored on IPFS

Smart contract stores:

owner address

certificate hash

IPFS link

Anyone can verify certificate on the Blockchain

If admin invalidates the certificate → marked as invalid

📜 License

This project is licensed under the MIT License.

💡 Contributions

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to modify.
