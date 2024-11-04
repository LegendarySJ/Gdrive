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
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [accounts, setAccounts] = useState(() => {
    const savedAccounts = localStorage.getItem("accounts");
    try {
      return savedAccounts ? JSON.parse(savedAccounts) : [];
    } catch (e) {
      console.error("Error parsing accounts:", e);
      return [];
    }
  });
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    const initializeProvider = async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
        setProvider(provider);
        console.log("Provider initialized");
      } catch (error) {
        console.error("Provider initialization error:", error);
        setErrorMessage("Failed to connect to Ethereum network");
      }
    };

    initializeProvider();
  }, []);

  const initializeWallet = async (privateKey) => {
    try {
      console.log("Initializing wallet...");
      if (!provider) {
        throw new Error("Provider not initialized");
      }

      const wallet = new ethers.Wallet(privateKey, provider);
      const address = await wallet.getAddress();
      
      // Get the contract
      const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
      const contract = new ethers.Contract(contractAddress, Upload.abi, wallet);
      
      console.log("Wallet initialized with address:", address);
      
      setAccount(address);
      setContract(contract);
      return { contract, address };
    } catch (error) {
      console.error("Wallet initialization error:", error);
      throw new Error(`Failed to initialize wallet: ${error.message}`);
    }
  };

  const handleAccountSelect = async (account) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      console.log("Selecting account:", account.account_name);
      
      const { contract, address } = await initializeWallet(account.privateKey);
      setSelectedAccount(account);
      
      console.log("Account selected successfully");
    } catch (error) {
      console.error("Account selection error:", error);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (loginData) => {
    try {
      console.log("Processing login...");
      const { token, accounts } = loginData;
      
      localStorage.setItem("token", token);
      localStorage.setItem("accounts", JSON.stringify(accounts));
      
      setToken(token);
      setAccounts(accounts);
      
      if (accounts.length === 1) {
        await handleAccountSelect(accounts[0]);
      }
      
      console.log("Login successful");
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("Login failed: " + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accounts");
    setToken(null);
    setAccount("");
    setContract(null);
    setSelectedAccount(null);
    setAccounts([]);
    setIsLoading(false);
    console.log("Logged out successfully");
  };

  useEffect(() => {
    const initializeFromStorage = async () => {
      try {
        if (token && accounts.length > 0 && !selectedAccount) {
          console.log("Initializing from storage...");
          if (accounts.length === 1) {
            await handleAccountSelect(accounts[0]);
          }
        }
      } catch (error) {
        console.error("Storage initialization error:", error);
        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeFromStorage();
  }, [token, accounts.length]);

  if (isLoading) {
    return (
      <div className="loading-container">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <h1 style={{ color: "white" }}>Gdrive 3.0</h1>
        
        {errorMessage && (
          <div className="error-banner">
            {errorMessage}
            <button onClick={() => setErrorMessage("")}>✕</button>
          </div>
        )}
        
        {token ? (
          <div>
            <div className="header">
              <button onClick={handleLogout}>Logout</button>
              {account && <p style={{ color: "white" }}>Account: {account}</p>}
            </div>

            {!selectedAccount && accounts.length > 1 ? (
              <div className="account-selection">
                <h2>Select an Account</h2>
                <div className="account-list">
                  {accounts.map((acc, index) => (
                    <button
                      key={index}
                      onClick={() => handleAccountSelect(acc)}
                      className="account-button"
                    >
                      {acc.account_name}
                    </button>
                  ))}
                </div>
              </div>
            ) : selectedAccount && contract ? (
              <div>
                <button className="share" onClick={() => setModalOpen(true)}>
                  Share
                </button>
                {modalOpen && (
                  <Modal setModalOpen={setModalOpen} contract={contract} />
                )}
                <FileUpload
                  account={account}
                  provider={provider}
                  contract={contract}
                />
                <Display 
                  contract={contract} 
                  account={account}
                  provider={provider}
                  selectedAccount={selectedAccount}
                />
              </div>
            ) : null}
          </div>
        ) : (
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;