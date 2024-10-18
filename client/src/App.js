import Upload from "./artifacts/contracts/Upload.sol/upload.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import FileUpload from "./components/FileUpload";
import Display from "./components/Display";
import Modal from "./components/Modal";
import Login from "./components/Login"; // New Login component
import "./App.css";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userAccounts, setUserAccounts] = useState([]); // Accounts from the database
  const [selectedAccount, setSelectedAccount] = useState(null); // Selected account
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Login state

  useEffect(() => {
    const initProvider = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      // Handle account and chain changes
      window.ethereum.on("chainChanged", () => window.location.reload());
      window.ethereum.on("accountsChanged", () => window.location.reload());

      try {
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        // Set up the contract
        const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Replace with your deployed contract address
        const contract = new ethers.Contract(contractAddress, Upload.abi, signer);
        setContract(contract);
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    };

    if (window.ethereum) {
      initProvider();
    } else {
      console.error("MetaMask is not installed");
    }
  }, []);

  // Handle user login
  const handleLogin = async (username, password) => {
    // Call your backend API to authenticate the user
    const response = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      setUserAccounts(data.accounts); // Assuming the backend sends the user's accounts
      setIsLoggedIn(true);
    } else {
      alert("Login failed. Please check your credentials.");
    }
  };

  // Handle account selection
  const handleSelectAccount = (account) => {
    setSelectedAccount(account);
    setAccount(account.address); // Set the selected account address
  };

  return (
    <>
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} /> // Render the Login component
      ) : (
        <>
          {!modalOpen && (
            <button className="share" onClick={() => setModalOpen(true)}>
              Share
            </button>
          )}
          {modalOpen && (
            <Modal setModalOpen={setModalOpen} contract={contract} />
          )}

          <div className="App">
            <h1 style={{ color: "white" }}>Gdrive 3.0</h1>
            <div className="bg"></div>
            <div className="bg bg2"></div>
            <div className="bg bg3"></div>

            <p style={{ color: "white" }}>
              Account: {selectedAccount ? selectedAccount.name : "Select an account"}
            </p>

            {/* Account Selection */}
            {userAccounts.length > 0 && (
              <div>
                <h2>Select Your Account:</h2>
                {userAccounts.map((acc) => (
                  <button key={acc.id} onClick={() => handleSelectAccount(acc)}>
                    {acc.name} {/* Display account name */}
                  </button>
                ))}
              </div>
            )}

            <FileUpload account={selectedAccount} provider={provider} contract={contract} />
            <Display contract={contract} account={selectedAccount} />
          </div>
        </>
      )}
    </>
  );
}

export default App;
