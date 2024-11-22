import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";

function App() {
  const [depositValue, setDepositValue] = useState(0);
  const [greet, setGreet] = useState('');
  const [greetingValue, setGreetingValue] = useState('');
  const [balance, setBalance] = useState();
  const [contract, setContract] = useState(null); // Lưu trữ contract instance

  useEffect(() => {
    const init = async () => {
      if (!window.ethereum) {
        console.error("MetaMask not installed!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
      const ABI = [{
            "inputs": [
              {
                "internalType": "string",
                "name": "_greeting",
                "type": "string"
              }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
          },
          {
            "inputs": [],
            "name": "deposit",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
          },
          {
            "inputs": [],
            "name": "greet",
            "outputs": [
              {
                "internalType": "string",
                "name": "",
                "type": "string"
              }
            ],
            "stateMutability": "view",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "string",
                "name": "_greeting",
                "type": "string"
              }
            ],
            "name": "setGreeting",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          }];
      const contractInstance = new ethers.Contract(contractAddress, ABI, signer);
      setContract(contractInstance);

      try {
        // Yêu cầu quyền truy cập tài khoản
        await provider.send("eth_requestAccounts", []);

        // Lấy greeting ban đầu
        const greeting = await contractInstance.greet();
        setGreet(greeting);

        // Lấy balance ban đầu
        const balance = await provider.getBalance(contractAddress);
        setBalance(ethers.utils.formatEther(balance));
      } catch (error) {
        console.error("Error initializing:", error);
      }
    };

    init();
  }, []); // Không phụ thuộc vào contract hay provider nữa

  const handleDepositChange = (e) => {
    setDepositValue(e.target.value);
  };

  const handleGreetingChange = (e) => {
    setGreetingValue(e.target.value);
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!contract) return;

    try {
      const ethValue = ethers.utils.parseEther(depositValue);
      const deposit = await contract.deposit({ value: ethValue });
      await deposit.wait();
      const balance = await contract.provider.getBalance(contract.address);
      setBalance(ethers.utils.formatEther(balance));
    } catch (error) {
      console.error("Deposit error:", error);
    }
  };

  const handleGreetingSubmit = async (e) => {
    e.preventDefault();
    if (!contract) return;

    try {
      await contract.setGreeting(greetingValue);
      setGreet(greetingValue);
      setGreetingValue('');
    } catch (error) {
      console.error("Greeting error:", error);
    }
  };

  return (
      <div className="container">
        <div className="row mt-5">
          <div className="col">
            <h3>{greet}</h3>
            <p>Contract Balance: {balance} ETH</p>
          </div>

          <div className="col">
            <div className="mb-3">
              <h4>Deposit ETH</h4>
              <form onSubmit={handleDepositSubmit}>
                <div className="mb-3">
                  <input
                      type="number"
                      className="form-control"
                      placeholder="0"
                      onChange={handleDepositChange}
                      value={depositValue}
                  />
                </div>
                <button type="submit" className="btn btn-success">
                  Deposit
                </button>
              </form>

              <h4 className="mt-3">Change Greeting</h4>
              <form onSubmit={handleGreetingSubmit}>
                <div className="mb-3">
                  <input
                      type="text"
                      className="form-control"
                      placeholder="Enter new greeting"
                      onChange={handleGreetingChange}
                      value={greetingValue}
                  />
                </div>
                <button type="submit" className="btn btn-dark">
                  Change
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
  );
}

export default App;