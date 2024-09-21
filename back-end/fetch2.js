require('dotenv').config();
const { ethers } = require('ethers');
const { contractABI, contractAddress } = require('./config');

// Initialize provider using your Infura or Alchemy endpoint
const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL);

// Create a contract instance
const contract = new ethers.Contract(contractAddress, contractABI, provider);

// Function to display all data in the contract
async function displayContractData() {
  try {
    // Fetch the owner address just for reference (optional)
    const owner = await contract.owner();
    console.log('Contract Owner:', owner);

    // Fetch the total number of reports using reportCount
    const totalReports = await contract.reportCount();
    console.log('Total Reports:', totalReports.toString());

    // Loop through each report
    for (let reportId = 0; reportId < totalReports; reportId++) {
      try {
        // Convert reportId to a BigNumber
        const report = await contract.reports(reportId);
        console.log(`\n--- Report ID: ${reportId.toString()} ---`);
        console.log(`Reporter Address: ${report.reporter}`);
        console.log(`Description: ${report.description}`);
        console.log(`Location: ${report.location}`);
        console.log(`Evidence Link: ${report.evidenceLink}`);
        console.log(`Verified: ${report.verified}`);
        console.log(`Reward: ${ethers.formatEther(report.reward)} ETH`);
        // console.log(`Timestamp: ${new Date(report.timestamp * 1000).toLocaleString()}`);
      } catch (error) {
        console.error(`Error fetching report ${reportId}:`, error);
      }
    }

  } catch (error) {
    console.error('Error fetching contract data:', error);
  }
}

// Run the function to display contract data
displayContractData();
