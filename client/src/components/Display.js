import { useState } from "react";
import "./Display.css";

const Display = ({ contract, account }) => {
  const [data, setData] = useState([]);
  const [inputAddress, setInputAddress] = useState(""); // State to manage user input address
  const [loading, setLoading] = useState(false); // State to manage loading status

  const getData = async () => {
    setLoading(true); // Set loading to true while fetching data
    setData([]); // Clear previous data

    let dataArray;
    const addressToCheck = inputAddress || account; // Use input address or default to account

    try {
      dataArray = await contract.display(addressToCheck);
      console.log(dataArray);
      
      const isEmpty = !dataArray || dataArray.length === 0;

      if (!isEmpty) {
        const images = dataArray.map((item, i) => (
          <a href={item} key={i} target="_blank" rel="noopener noreferrer">
            <img
              src={`https://gateway.pinata.cloud/ipfs/${item.substring(6)}`}
              alt="Uploaded content"
              className="image-list"
            />
          </a>
        ));
        setData(images);
      } else {
        alert("No images to display.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("You don't have access or an error occurred while fetching data.");
    } finally {
      setLoading(false); // Set loading to false after data fetching completes
    }
  };

  return (
    <>
      <div className="image-list">{data}</div>
      <input
        type="text"
        placeholder="Enter Address"
        className="address"
        value={inputAddress}
        onChange={(e) => setInputAddress(e.target.value)} // Update state with user input
      />
      <button className="center button" onClick={getData} disabled={loading}>
        {loading ? "Loading..." : "Get Data"}
      </button>
    </>
  );
};

export default Display;
