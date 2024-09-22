import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { contractABI, contractAddress } from './config';
import { FileText, MapPin, Link as LinkIcon, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';
import './App.css';

// Replace with the actual owner's address of the deployed contract
const OWNER_ADDRESS = "0x0a5be85d5437d8db3887de2acf64457c67030278";

function App() {
  const [reports, setReports] = useState([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isOwner, setIsOwner] = useState(false); // State to check if the user is the owner
  const [preview, setPreview] = useState(null); // State to manage image preview

  // Fetch reports from the backend
  useEffect(() => {
    axios.get('http://localhost:5000/api/reports')
      .then((response) => {
        setReports(response.data);
      })
      .catch((error) => {
        console.error('Error fetching reports:', error);
      });
  }, []);

  // Wallet connection logic
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const connectedAccount = accounts[0];
        setAccount(connectedAccount);

        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contractInstance);
        
        // Check if the connected account is the owner
        setIsOwner(connectedAccount.toLowerCase() === OWNER_ADDRESS.toLowerCase());
        
        setWalletConnected(true);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setWalletConnected(false);
    setContract(null);
    setIsOwner(false); // Reset owner state on disconnect
  };

  // Verifying reports
  const verifyReport = async (reportId) => {
    if (!contract) return;

    try {
      const rewardAmount = prompt("Enter reward amount (in ETH):");
      const tx = await contract.verifyReport(reportId, ethers.parseEther(rewardAmount), {
        value: ethers.parseEther(rewardAmount), // Send ETH as reward
      });
      await tx.wait(); // Wait for transaction confirmation
      alert("Report verified successfully!");

      // Refresh the report list after verification
      const updatedReports = await axios.get('http://localhost:5000/api/reports');
      setReports(updatedReports.data);
    } catch (error) {
      console.error('Error verifying report:', error);
      alert('Failed to verify the report');
    }
  };

  // Function to toggle image preview
  const togglePreview = (link) => {
    setPreview(preview === link ? null : link);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-indigo-800">
        Admin Panel - Reports
      </h1>

      {/* Wallet Connect/Disconnect Button */}
      <div className="flex justify-center mb-6">
        {walletConnected ? (
          <div>
            <button
              className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
              onClick={disconnectWallet}
            >
              Disconnect Wallet
            </button>
            <p className="mt-2 text-indigo-800 font-bold">Connected Account: {account}</p>
            {isOwner && <p className="mt-2 text-green-600 font-bold">You are the contract owner!</p>}
            {!isOwner && <p className="mt-2 text-red-600 font-bold">You are not the contract owner.</p>}
          </div>
        ) : (
          <button
            className="bg-indigo-500 text-white px-6 py-2 rounded-md hover:bg-indigo-600"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-indigo-600 mb-4">Report ID: {report.id}</h2>

            <p className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-500" />
              <span className="font-semibold">Reporter:</span>
              <span className="ml-2">{report.reporter}</span>
            </p>

            <p className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-indigo-500" />
              <span className="font-semibold">Description:</span>
              <span className="ml-2">{report.description}</span>
            </p>

            <p className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-indigo-500" />
              <span className="font-semibold">Location:</span>
              <span className="ml-2">{report.location}</span>
            </p>

            <div>
              <p className="flex items-center">
                <LinkIcon className="w-5 h-5 mr-2 text-indigo-500" />
                <span className="font-semibold">Evidence Link:</span>
              </p>
              <button 
                className="mt-2 text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md" 
                onClick={() => togglePreview(report.evidenceLink)}
              >
                {preview === report.evidenceLink ? 'Hide Preview' : 'View Preview'}
              </button>
              {preview === report.evidenceLink && (
                <div className="mt-4">
                  <img
                    src={report.evidenceLink}
                    alt="Evidence Preview"
                    className="max-w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>

            {/* Verify Button */}
            {!report.verified && (
              <button
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                onClick={() => verifyReport(report.id)}
              >
                Verify Report
              </button>
            )}

            <p className="flex items-center mt-4">
              <CheckCircle className="w-5 h-5 mr-2 text-indigo-500" />
              <span className="font-semibold">Verified:</span>
              <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${report.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {report.verified ? 'Yes' : 'No'}
              </span>
            </p>

            <p className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-indigo-500" />
              <span className="font-semibold">Reward:</span>
              <span className="ml-2 text-green-600 font-bold">{report.reward} ETH</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
