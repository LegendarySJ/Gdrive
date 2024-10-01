import Upload from "./artifacts/contracts/Upload.sol/upload.json";
import {useState, useEffect} from "react";
import {ethers} from "ethers";
import FileUpload from "./components/FileUpload";
import Display from "./components/Display";
import Modal from "./components/Modal";
import './App.css';

function App() {
  const [account,setAccount] = useState("");
  const [contract,setContract] = useState(null);
  const [provider,setProvider] = useState(null);
  const [modalOpen,setModalOpen] = useState(null);

  useEffect(() => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const loadProvider = async() =>{
      if(provider){
        await provider.send("eth_requestAccounts",[]);
        const signer = provider.getSigner();
        
      }
    }
  })
  return (
    <div className="App">
      
    </div>
  );
}
export default App;
