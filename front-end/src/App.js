import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { contractABI, contractAddress } from './config';
import { FileText, MapPin, Link as LinkIcon, CheckCircle, AlertTriangle, DollarSign } from 'lucide-react';
import './App.css';

function App() {
  const [reports, setReports] = useState([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

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
        setAccount(accounts[0]);

        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        setContract(contractInstance);
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
              <a href={report.evidenceLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                {report.evidenceLink}
              </a>
            </div>

            {/* Verify Button should be visible here */}
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
