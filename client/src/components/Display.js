import { useState } from "react";
import "./Display.css";

const Display = ({ contract, account }) => {
  const [data, setData] = useState([]);
  const [inputAddress, setInputAddress] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state

  const getData = async () => {
    setLoading(true); // Set loading to true when fetching data
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
              alt={`Image ${i}`}
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
      setLoading(false); // Set loading to false after fetching completes
    }
  };

  return (
    <div className="display-container">
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
          disabled={loading} // Disable button while loading
        >
          {loading ? "Loading..." : "Get Data"} {/* Display loading text */}
        </button>
      </div>
      <div className="image-list-container">{data}</div>
    </div>
  );
};

export default Display;