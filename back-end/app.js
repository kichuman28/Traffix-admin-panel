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

    // Variable to track the report index
    let reportId = 1;
    let moreReports = true;

    // Loop to fetch all the reports
    while (moreReports) {
      try {
        const report = await contract.reports(reportId);
        console.log(`\n--- Report ID: ${reportId} ---`);
        console.log(`Reporter Address: ${report.reporter}`);
        console.log(`Description: ${report.description}`);
        console.log(`Location: ${report.location}`);
        console.log(`Evidence Link: ${report.evidenceLink}`);
        console.log(`Verified: ${report.verified}`);
        console.log(`Reward: ${ethers.formatEther(report.reward)} ETH`);
        // console.log(`Timestamp: ${new Date(report.timestamp * 1000).toLocaleString()}`);

        reportId++;  // Move to the next report
      } catch (error) {
        // If we hit an error (like index out of bounds), stop the loop
        moreReports = false;
      }
    }

  } catch (error) {
    console.error('Error fetching contract data:', error);
  }
}

// Run the function to display contract data
displayContractData();
