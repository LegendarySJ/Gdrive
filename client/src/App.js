import Upload from "./artifacts/contracts/Upload.sol/upload.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import FileUpload from "./components/FileUpload";
import Display from "./components/Display";
import Modal from "./components/Modal";
import Login from "./components/Login";
import Signup from "./components/Signup";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';


function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadProvider = async () => {
      try {
        if (typeof window.ethereum === 'undefined') {
          throw new Error("MetaMask is not installed.");
        }

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        const contractAddress = "YOUR_CONTRACT_ADDRESS"; // **Make sure this is correct**
        const contract = new ethers.Contract(contractAddress, Upload.abi, signer);
        setContract(contract);
        setProvider(provider);
      } catch (error) {
        console.error("Error initializing provider:", error);
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProvider();

    window.ethereum?.on("chainChanged", () => window.location.reload());
    window.ethereum?.on("accountsChanged", () => window.location.reload());
  }, []);



  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem("token", token);
  };

  const handleLogout = () => {  // Add a logout handler
    setToken(null);
    localStorage.removeItem("token");
    // Optionally clear account/contract state
    setAccount("");
    setContract(null);
    setProvider(null);
  };


  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (errorMessage) {
    return <div>Error: {errorMessage}</div>;
  }

  return (
    <Router> {/* Wrap your app in a Router */}
      <div className="App">
        <h1 style={{ color: "white" }}>Gdrive 3.0</h1>
        {/* ... other styling divs */}

        {token ? ( // Conditionally render based on token
          <>
             <button onClick={handleLogout}>Logout</button> {/* Logout Button */}
            <p style={{ color: "white" }}>Account: {account}</p> {/* Show if logged in */}
            <button className="share" onClick={() => setModalOpen(true)}>Share</button>
            {modalOpen && <Modal setModalOpen={setModalOpen} contract={contract} />}
            <FileUpload account={account} provider={provider} contract={contract} />
            <Display contract={contract} account={account} />
          </>
        ) : (
          <Routes>  {/* Use Routes for navigation */}
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" />} /> {/* Redirect to login if no token */}
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;