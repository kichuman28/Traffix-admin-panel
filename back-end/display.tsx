'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPinIcon, LinkIcon, ShieldCheckIcon, CoinIcon } from 'lucide-react'
import {contractABI,contractAddress} from './config'
// Mock ABI and address - replace with your actual contract details
// const contractABI = [{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"reports","outputs":[{"internalType":"address","name":"reporter","type":"address"},{"internalType":"string","name":"description","type":"string"},{"internalType":"string","name":"location","type":"string"},{"internalType":"string","name":"evidenceLink","type":"string"},{"internalType":"bool","name":"verified","type":"bool"},{"internalType":"uint256","name":"reward","type":"uint256"}],"stateMutability":"view","type":"function"}]
// const contractAddress = '0x1234567890123456789012345678901234567890'

export default function ContractDataDisplay() {
  const [reports, setReports] = useState([])
  const [owner, setOwner] = useState('')

  useEffect(() => {
    const fetchContractData = async () => {
      // In a real application, you'd use a proper provider
      const provider = new ethers.JsonRpcProvider(process.env.INFURA_URL)
      const contract = new ethers.Contract(contractAddress, contractABI, provider)

      try {
        const ownerAddress = await contract.owner()
        setOwner(ownerAddress)

        let reportId = 1
        let moreReports = true
        const fetchedReports = []

        while (moreReports) {
          try {
            const report = await contract.reports(reportId)
            fetchedReports.push({
              id: reportId,
              reporter: report.reporter,
              description: report.description,
              location: report.location,
              evidenceLink: report.evidenceLink,
              verified: report.verified,
              reward: ethers.formatEther(report.reward)
            })
            reportId++
          } catch (error) {
            moreReports = false
          }
        }

        setReports(fetchedReports)
      } catch (error) {
        console.error('Error fetching contract data:', error)
      }
    }

    fetchContractData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Contract Reports</CardTitle>
          <p className="text-center text-muted-foreground">Contract Owner: {owner}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {reports.map((report) => (
              <Card key={report.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <h3 className="text-lg font-semibold mb-2">Report #{report.id}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPinIcon className="h-4 w-4" />
                      <span>{report.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm mt-2">
                      <LinkIcon className="h-4 w-4" />
                      <a href={report.evidenceLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Evidence Link
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <Badge variant={report.verified ? "success" : "secondary"} className="mb-2">
                      {report.verified ? (
                        <><ShieldCheckIcon className="h-4 w-4 mr-1" /> Verified</>
                      ) : (
                        'Unverified'
                      )}
                    </Badge>
                    <div className="flex items-center space-x-1 text-amber-600">
                      <CoinIcon className="h-5 w-5" />
                      <span className="font-semibold">{report.reward} ETH</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Reporter: {report.reporter.slice(0, 6)}...{report.reporter.slice(-4)}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}