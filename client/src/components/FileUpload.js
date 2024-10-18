import { useState } from "react";
import axios from "axios";
import "./FileUpload.css";

const FileUpload = ({ contract, account }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("No image selected");
  const [loading, setLoading] = useState(false); // State to manage loading status

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      setLoading(true); // Set loading to true when upload starts
      try {
        const formData = new FormData();
        formData.append("file", file);

        // Pin the file to IPFS using Pinata
        const resFile = await axios({
          method: "post",
          url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
          data: formData,
          headers: {
            pinata_api_key: `51bd33b7307e30887e87`,
            pinata_secret_api_key: `cc803c7cac8712104fa091f7426ec97e4b2c2b955a585e636562dcc51b207cfd`,
            "Content-Type": "multipart/form-data",
          },
        });

        const ImgHash = `https://gateway.pinata.cloud/ipfs/${resFile.data.IpfsHash}`;
        
        // Call the smart contract to add the uploaded file
        const transaction = await contract.add(account, ImgHash);
        await transaction.wait(); // Wait for the transaction to be confirmed

        alert("Successfully uploaded image and updated contract");
        resetForm(); // Reset the form
      } catch (e) {
        console.error("Error uploading image:", e);
        alert("Unable to upload image to Pinata or update contract");
      } finally {
        setLoading(false); // Set loading to false when upload completes
      }
    } else {
      alert("Please select a file to upload");
    }
  };

  const resetForm = () => {
    setFileName("No image selected");
    setFile(null);
  };

  const retrieveFile = (e) => {
    const data = e.target.files[0]; // Get the file
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(data);
    reader.onloadend = () => {
      setFile(e.target.files[0]);
    };
    setFileName(e.target.files[0].name);
    e.preventDefault();
  };

  return (
    <div className="top">
      <form className="form" onSubmit={handleSubmit}>
        <label htmlFor="file-upload" className="choose">
          Choose Image
        </label>
        <input
          disabled={!account} // Disable input if account is not connected
          type="file"
          id="file-upload"
          name="data"
          onChange={retrieveFile}
        />
        <span className="textArea">Image: {fileName}</span>
        <button type="submit" className="upload" disabled={!file || loading}>
          {loading ? "Uploading..." : "Upload File"}
        </button>
      </form>
    </div>
  );
};

export default FileUpload;
