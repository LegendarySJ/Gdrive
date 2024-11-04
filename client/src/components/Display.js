import { useState, useEffect } from "react";
import { ethers } from "ethers";
import "./Display.css";

const Display = ({ contract, account, provider, selectedAccount }) => {
  const [data, setData] = useState([]);
  const [inputAddress, setInputAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    const updateBalance = async () => {
      if (account && provider) {
        try {
          const balance = await provider.getBalance(account);
          setBalance(ethers.utils.formatEther(balance));
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };

    updateBalance();
  }, [account, provider]);

  const getData = async () => {
    if (!contract || !account) {
      console.error("Contract or account not initialized");
      return;
    }

    setLoading(true);
    setData([]);

    const addressToCheck = inputAddress || account;

    try {
      const dataArray = await contract.display(addressToCheck);

      if (dataArray && dataArray.length > 0) {
        const images = dataArray.map((item, i) => (
          <a
            href={item}
            key={i}
            target="_blank"
            rel="noopener noreferrer"
            className="image-container"
          >
            <img
              src={`https://gateway.pinata.cloud/ipfs/${item.substring(6)}`}
              alt={`Item ${i + 1}`}
              className="image-list"
              loading="lazy"
            />
          </a>
        ));
        setData(images);
      } else {
        setData(<p className="no-images-message">No images found for this address.</p>);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData(<p className="error-message">Error fetching data. Please check the address and try again.</p>);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="display-container">
      <div className="account-header">
        <div className="account-info">
          <p>Current Account: {selectedAccount?.account_name}</p>
          <p>Address: {account}</p>
          <p>Gas Balance: {balance} ETH</p>
        </div>
      </div>
      
      <div className="input-area">
        <input
          type="text"
          placeholder="Enter Address"
          className="address-input"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
        />
        <button
          className="get-data-button"
          onClick={getData}
          disabled={loading || !contract}
        >
          {loading ? "Loading..." : "Get Data"}
        </button>
      </div>
      <div className="image-list-container">{data}</div>
    </div>
  );
};

export default Display;