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
        const address = await signer.getAddress();
        setAccount(address);
        let contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

        const contract = new ethers.Contract(
          contractAddress,Upload.abi,signer
        );
        setContract(contract);
        setProvider(provider);
      }else{
        console.error("Metamask Error");
      }
    };
    provider && loadProvider();
  }, []);
  return (
    <div className="App">
      <h1>Decentralized storage</h1>
      <div class = "bg"></div>
      <div class = "bg bg2"></div>
      <div class = "bg bg3"></div>
      <p style = {{ color: "white"}}>Account : {account ? account: "Not connected"}</p>
    </div>
  );
}
export default App;
