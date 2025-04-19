"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { clsx, type ClassValue } from "clsx"

import { Search, User, Building } from "lucide-react"
import AssetRegisterPDFViewer from "./assetpdf"



function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "N/A"

  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return dateObj.toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid Date"
  }
}

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key])
      if (!result[groupKey]) {
        result[groupKey] = []
      }
      result[groupKey].push(item)
      return result
    },
    {} as Record<string, T[]>,
  )
}

// Define the AssetRegister interface
interface AssetRegister {
  companyname: string
  lastserviced: Date
  equipuid: number
  bnqitemcode: string
  model: string
  manufacturer: string
  equiptype: string
  description: string
  inservice: boolean
  customercode: string
  dom: number
}

// Header Component
function Header() {
  return (
    <header className="border-b pb-4 pt-4">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        {/* Logo on the left */}
        <div className="mb-4 md:mb-0">
          <a href="/">
            <img src="/logo.png" alt="Dental Installations Logo" width={200} height={60} className="h-auto" />
          </a>
        </div>

        {/* Contact details on the right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-2 text-sm">
          <div>
            <div className="font-bold text-gray-800">Phone:</div>
            <a href="tel:1300305267" className="text-amber-700 hover:underline">
              1300 305 267
            </a>

            <div className="font-bold text-gray-800 mt-2">Email:</div>
            <a href="mailto:sales@dentalinstallations.com.au" className="text-amber-700 hover:underline">
              sales@dentalinstallations.com.au
            </a>

            <div className="font-bold text-gray-800 mt-2">Fax:</div>
            <div className="text-amber-700">02 9522 5272</div>
          </div>

          <div>
            <div className="font-bold text-gray-800">Warehouse & Showroom:</div>
            <div>27/205 Port Hacking Road</div>
            <div className="text-amber-700">MIRANDA NSW 2228</div>

            <div className="font-bold text-gray-800 mt-2">Postal Address:</div>
            <div>Dental Installations (Aust) Pty Ltd</div>
            <div>PO Box 2435</div>
            <div className="text-amber-700">TAREN POINT NSW 2229</div>
          </div>
        </div>
      </div>
    </header>
  )
}

// Asset Group Component
interface AssetGroupProps {
  groupName: string
  assets: AssetRegister[]
}

function AssetGroup({ groupName, assets }: AssetGroupProps) {
  // Format the group name to match the example format
  const formattedGroupName = groupName.toUpperCase()

  return (
    <div className="border-b pb-4">
      <h2 className="text-sm font-bold mb-2">Asset Register - {formattedGroupName}</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-1 text-left">Asset ID</th>
              <th className="px-2 py-1 text-left">Identifier</th>
              <th className="px-2 py-1 text-left">Model No.</th>
              <th className="px-2 py-1 text-left">Serial No.</th>
              <th className="px-2 py-1 text-left">DOM/Install Date</th>
              <th className="px-2 py-1 text-left">Service Level</th>
              <th className="px-2 py-1 text-left">Service Date</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => {
              // Format the date - if lastserviced is available, use it
              const serviceDate = asset.lastserviced ? new Date(asset.lastserviced) : null

              const formattedServiceDate = serviceDate ? format(serviceDate, "dd/MM/yyyy") : "N/A"

              return (
                <tr key={asset.equipuid} className="border-t">
                  <td className="px-2 py-2">{asset.equipuid}</td>
                  <td className="px-2 py-2">{asset.bnqitemcode || "ONE (1)"}</td>
                  <td className="px-2 py-2">{asset.model || "-"}</td>
                  <td className="px-2 py-2">{asset.description || "-"}</td>
                  <td className="px-2 py-2">{asset.dom ? asset.dom.toString() : "-"}</td>
                  <td className="px-2 py-2">Yearly - MANUFACTURER SERVICE</td>
                  <td className="px-2 py-2">{formattedServiceDate}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
interface Result {
  customercode: string
  companyname: string
  physicaladdress: string
  contactname: string
}
// Main Page Component
export default function AssetRegisterPage() {
  const [search, setSearch] = useState("")
  const [results, setResults] = useState<Result[]>([])
  const [debouncedSearch, setDebouncedSearch] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  // Fetch results when debounced search changes
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearch.length < 2) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(
          `https://diapi.icyforest-7eae763b.australiaeast.azurecontainerapps.io/api/CustomerDetail/search/${debouncedSearch}/2`,
        )

        if (!response.ok) {
          throw new Error("Network response was not ok")
        }

        const data = await response.json()
        setResults(data)
      } catch (error) {
        console.error("Error fetching results:", error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [debouncedSearch])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const handleResultClick = async (result: Result) => {
    setCustomer(result)
    await fetchAssets(result.customercode)
    setSearch("");
  }
  const [pdf,setPdf] = useState(false)
  const [assets, setAssets] = useState<AssetRegister[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<Result|null>(null)

    const fetchAssets = async (custcode:string) => {
      try {
        const response = await fetch(
          "https://diapi.icyforest-7eae763b.australiaeast.azurecontainerapps.io/api/AssetRegisterRpt/"+custcode,
        )

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()
        setAssets(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch assets")
        console.error("Error fetching assets:", err)
      } finally {
        setLoading(false)
      }
    }

  // Group assets by equipment type
  const groupedAssets = assets.reduce(
    (groups, asset) => {
      const key = `${asset.equiptype} - ${asset.manufacturer} ${asset.model}`.trim()
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(asset)
      return groups
    },
    {} as Record<string, AssetRegister[]>,
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <p>Please try again later or contact support.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
     {pdf && customer && <AssetRegisterPDFViewer customercode={customer.customercode} customername={customer.companyname} onclose={()=>setPdf(false) }/>}
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        <Header />


        <div className="max-w-md mx-auto p-4">
      <div className="flex items-center">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={search}
          onChange={handleChange}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-150 ease-in-out"
          placeholder="Search customers..."
        />
         
      </div>
    
      {assets.length>0 &&  <button onClick={()=>setPdf(true)} className="bg-teal-500 text-white px-4 py-2 rounded-md m-2">PDF</button>}
       
      </div>
      {loading && (
        <div className="mt-2 p-4 text-center text-gray-500">
          <div
            className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full"
            aria-hidden="true"
          ></div>
          <p className="mt-2">Searching...</p>
        </div>
      )}

{search!="" && 
  <>
      {results.length > 0 && (
        <div className="mt-2 bg-white shadow-lg rounded-md border border-gray-200 overflow-hidden">
          
          <ul className="divide-y divide-gray-200">
            
            {results.map((result, index) => (
              <li
                key={index}
                onClick={() => handleResultClick(result)}
                className="px-4 py-3 hover:bg-teal-50 cursor-pointer transition-colors duration-150"
              >
                <div className="flex items-center">
                
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{result.physicaladdress}</div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Building className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      {result.companyname} - {result.contactname}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {debouncedSearch.length >= 2 && results.length === 0 && !loading && (
        <div className="mt-2 p-4 text-center text-gray-500 bg-white shadow-lg rounded-md border border-gray-200">
          No customers found
        </div>
      )}
</>}

    </div>

          
      
        <div className="mt-8 space-y-8">
          {Object.entries(groupedAssets).length > 0 ? (
            Object.entries(groupedAssets).map(([groupName, groupAssets]) => (
              <AssetGroup key={groupName} groupName={groupName} assets={groupAssets} />
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No assets found.</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-between items-center border-t pt-4">
          <div className="text-sm text-gray-500">ASSET MAINTENANCE LIST</div>
          <div className="text-sm text-gray-500"></div>
        </div>
      </div>
    </div>
  )
}
