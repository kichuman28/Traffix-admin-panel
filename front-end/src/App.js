import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ethers } from 'ethers';
import { contractABI, contractAddress } from './config';
import { FileText, MapPin, Link as LinkIcon, CheckCircle, AlertTriangle, DollarSign, X, ChevronDown } from 'lucide-react';
import './App.css';  // Assuming you have custom styles

function App() {
  const [reports, setReports] = useState([]);
  const [expandedReport, setExpandedReport] = useState(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

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

        const ownerAddress = await contractInstance.owner();
        setIsOwner(ownerAddress.toLowerCase() === accounts[0].toLowerCase());

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
    setIsOwner(false);
  };

  // Verifying reports (only for the contract owner)
  const verifyReport = async (reportId) => {
    if (!isOwner) {
      alert("Only the contract owner can verify reports.");
      return;
    }

    try {
      const rewardAmount = prompt("Enter reward amount (in ETH):");
      const tx = await contract.verifyReport(reportId, ethers.parseEther(rewardAmount), {
        value: ethers.parseEther(rewardAmount), // Send ETH as reward
      });
      await tx.wait();
      alert("Report verified successfully!");

      // Refresh the report list after verification
      const updatedReports = await axios.get('http://localhost:5000/api/reports');
      setReports(updatedReports.data);
    } catch (error) {
      console.error('Error verifying report:', error);
      alert('Failed to verify the report');
    }
  };

  const toggleReport = (id) => {
    setExpandedReport(expandedReport === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-8 overflow-x-hidden">
      <h1 className="text-5xl font-bold mb-8 text-center text-indigo-800 animate-fade-in">
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

      <div className="space-y-6">
        {reports.map((report) => (
          <div 
            key={report.id} 
            className="w-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
          >
            <div
              className="p-6 cursor-pointer group"
              onClick={() => toggleReport(report.id)}
            >
              <h2 className="text-2xl font-bold text-indigo-600 flex justify-between items-center group-hover:text-indigo-800 transition-colors duration-300">
                Report ID: {report.id}
                {expandedReport === report.id ? (
                  <X className="w-6 h-6 transition-transform duration-300 transform rotate-0 group-hover:rotate-90" />
                ) : (
                  <ChevronDown className="w-6 h-6 transition-transform duration-300 transform rotate-0 group-hover:-rotate-180" />
                )}
              </h2>
            </div>

            <div 
              className={`overflow-hidden transition-all duration-500 ease-in-out ${expandedReport === report.id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <div className="p-6 border-t border-indigo-100 space-y-4">
                <p className="flex items-center">
                  <FileText className="w-5 h-5 mr-3 text-indigo-500" />
                  <span className="font-semibold text-indigo-800">Reporter:</span>
                  <span className="ml-2 text-gray-600">{report.reporter}</span>
                </p>
                <p className="flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-3 text-indigo-500 mt-1" />
                  <span className="font-semibold text-indigo-800">Description:</span>
                  <span className="ml-2 flex-1 text-gray-600">{report.description}</span>
                </p>
                <p className="flex items-center">
                  <MapPin className="w-5 h-5 mr-3 text-indigo-500" />
                  <span className="font-semibold text-indigo-800">Location:</span>
                  <span className="ml-2 text-gray-600">{report.location}</span>
                </p>
                <div>
                  <p className="flex items-center mb-2">
                    <LinkIcon className="w-5 h-5 mr-3 text-indigo-500" />
                    <span className="font-semibold text-indigo-800">Evidence:</span>
                  </p>
                  <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                    <img src={report.evidenceLink} alt="Evidence" className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-300" />
                  </div>
                </div>
                <p className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 text-indigo-500" />
                  <span className="font-semibold text-indigo-800">Verified:</span>
                  <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${report.verified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {report.verified ? 'Yes' : 'No'}
                  </span>
                </p>
                <p className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-3 text-indigo-500" />
                  <span className="font-semibold text-indigo-800">Reward:</span>
                  <span className="ml-2 text-green-600 font-bold">{report.reward} ETH</span>
                </p>

                {/* Button to verify report (Visible only to the owner) */}
                {isOwner && !report.verified && (
                  <button
                    className="bg-indigo-500 text-white px-4 py-2 mt-4 rounded-md hover:bg-indigo-600"
                    onClick={() => verifyReport(report.id)}
                  >
                    Verify Report
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
