"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf } from "@react-pdf/renderer"
import { saveAs } from "file-saver"
import { format } from "date-fns"
import { Search, Mail, Download, Loader2, X } from "lucide-react"

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

interface Result {
  customercode: string
  companyname: string
  physicaladdress: string
  contactname: string
}

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "1px solid #ccc",
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logo: {
    width: 300,
  },
  contactInfo: {
    fontSize: 9,
  },
  contactLabel: {
    fontWeight: "bold",
    marginTop: 5,
  },
  contactValue: {
    color: "#B45309", // amber-700
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 5,
  },
  table: {
    flexDirection: "column",
    width: "auto",
    marginBottom: 10,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#eee",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    borderBottomStyle: "solid",
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
    fontWeight: "bold",
  },
  tableCell: {
    padding: 5,
    fontSize: 8,
  },
  idCell: { width: "10%" },
  identifierCell: { width: "15%" },
  modelCell: { width: "15%" },
  serialCell: { width: "20%" },
  domCell: { width: "10%" },
  serviceLevelCell: { width: "15%" },
  serviceDateCell: { width: "15%" },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    borderTopStyle: "solid",
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#6b7280",
  },
  noAssets: {
    textAlign: "center",
    padding: 20,
    color: "#6b7280",
  },
})

// PDF Document Component
const AssetRegisterPDF = ({ assets, customerName }: { assets: AssetRegister[]; customerName?: string }) => {
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text>Dental Installations</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Phone:</Text>
              <Text style={styles.contactValue}>1300 305 267</Text>

              <Text style={styles.contactLabel}>Email:</Text>
              <Text style={styles.contactValue}>sales@dentalinstallations.com.au</Text>

              <Text style={styles.contactLabel}>Address:</Text>
              <Text>27/205 Port Hacking Road</Text>
              <Text style={styles.contactValue}>MIRANDA NSW 2228</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Asset Register {customerName ? `- ${customerName}` : ""}</Text>

        {/* Asset Groups */}
        {Object.entries(groupedAssets).length > 0 ? (
          Object.entries(groupedAssets).map(([groupName, groupAssets]) => (
            <View key={groupName} wrap={false}>
              <Text style={styles.groupTitle}>Asset Register - {groupName.toUpperCase()}</Text>

              <View style={styles.table}>
                {/* Table Header */}
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, styles.idCell]}>Asset ID</Text>
                  <Text style={[styles.tableCell, styles.identifierCell]}>Identifier</Text>
                  <Text style={[styles.tableCell, styles.modelCell]}>Model No.</Text>
                  <Text style={[styles.tableCell, styles.serialCell]}>Serial No.</Text>
                  <Text style={[styles.tableCell, styles.domCell]}>DOM/Install Date</Text>
                  <Text style={[styles.tableCell, styles.serviceLevelCell]}>Service Level</Text>
                  <Text style={[styles.tableCell, styles.serviceDateCell]}>Service Date</Text>
                </View>

                {/* Table Rows */}
                {groupAssets.map((asset) => {
                  const serviceDate = asset.lastserviced ? new Date(asset.lastserviced) : null
                  const formattedServiceDate = serviceDate ? format(serviceDate, "dd/MM/yyyy") : "N/A"

                  return (
                    <View key={asset.equipuid} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.idCell]}>{asset.equipuid}</Text>
                      <Text style={[styles.tableCell, styles.identifierCell]}>{asset.bnqitemcode || "ONE (1)"}</Text>
                      <Text style={[styles.tableCell, styles.modelCell]}>{asset.model || "-"}</Text>
                      <Text style={[styles.tableCell, styles.serialCell]}>{asset.description || "-"}</Text>
                      <Text style={[styles.tableCell, styles.domCell]}>{asset.dom ? asset.dom.toString() : "-"}</Text>
                      <Text style={[styles.tableCell, styles.serviceLevelCell]}>Yearly - MANUFACTURER SERVICE</Text>
                      <Text style={[styles.tableCell, styles.serviceDateCell]}>{formattedServiceDate}</Text>
                    </View>
                  )
                })}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noAssets}>
            <Text>No assets found.</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>ASSET MAINTENANCE LIST</Text>
          <Text></Text>
        </View>
      </Page>
    </Document>
  )
}

// Main Component
export default function AssetRegisterPDFViewer({customercode,customername,onclose}:{customercode: string,customername:string,onclose:()=>void}) {
  //const [search, setSearch] = useState("")
  //const [results, setResults] = useState<Result[]>([])
  //const [debouncedSearch, setDebouncedSearch] = useState("")
  const [assets, setAssets] = useState<AssetRegister[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  //const [selectedCustomer, setSelectedCustomer] = useState<Result | null>(null)
  const [isPdfReady, setIsPdfReady] = useState(false)


  useEffect(() => {
    fetchAssets()
  }, [customercode])

  const fetchAssets = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `https://diapi.icyforest-7eae763b.australiaeast.azurecontainerapps.io/api/AssetRegisterRpt/${customercode}`,
      )

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      setAssets(data)
      setIsPdfReady(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch assets")
      console.error("Error fetching assets:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (assets.length === 0) return

    try {
      const blob = await pdf(<AssetRegisterPDF assets={assets} customerName={customername} />).toBlob()

      saveAs(blob, `asset-register-${customername.replace(/\s+/g, "-").toLowerCase() || "report"}.pdf`)
    } catch (error) {
      console.error("Error generating PDF:", error)
    }
  }

  const handleEmailPDF = async () => {
    if (assets.length === 0 || !customername) return

    try {
      const blob = await pdf(<AssetRegisterPDF assets={assets} customerName={customername} />).toBlob()

      // Convert blob to base64
      const reader = new FileReader()
      reader.readAsDataURL(blob)
      reader.onloadend = () => {
        const base64data = reader.result

        // Open email client with attachment
        // Note: This is a simple approach. In a production app, you would likely
        // send this to your backend to handle the email sending
        const subject = encodeURIComponent(`Asset Register for ${customername}`)
        const body = encodeURIComponent(`Please find attached the asset register for ${customername}.`)

        // This opens the default email client, but doesn't actually attach the PDF
        // For a real implementation, you would need a server-side solution
        window.location.href = `mailto:?subject=${subject}&body=${body}`

        alert(
          "Please note: For security reasons, browsers cannot automatically attach files to emails. The PDF has been generated and you can manually attach it to your email.",
        )
      }
    } catch (error) {
      console.error("Error generating PDF for email:", error)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <header className="border-b pb-4 pt-4">
          <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
            {/* Logo on the left */}
            <div className="mb-4 md:mb-0">
              <a href="/">
                <img src="/logo.png" alt="Dental Installations Logo" width={300} height={90} className="h-auto" />
              </a>
            </div>

            {/* Contact details on the right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <div>
                <div className="font-bold text-gray-800">Phone:</div>
                <a href="tel:1300305267" className="text-black hover:underline">
                  1300 305 267
                </a>

                <div className="font-bold text-gray-800 mt-2">Email:</div>
                <a href="mailto:sales@dentalinstallations.com.au" className="text-black hover:underline">
                  sales@dentalinstallations.com.au
                </a>

               
                
              </div>

              <div>
                <div className="font-bold text-black">Warehouse & Showroom:</div>
                <div>27/205 Port Hacking Road</div>
                <div className="text-black">MIRANDA NSW 2228</div>

                <div className="font-bold text-black mt-2">Postal Address:</div>
                <div>Dental Installations (Aust) Pty Ltd</div>
                <div>PO Box 2435</div>
                <div className="text-black">TAREN POINT NSW 2229</div>
              </div>
            </div>
          </div>
        </header>

        

        {/* PDF Preview and Actions */}
        {customername && (
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Asset Register for {customername}</h2>
              <div className="flex space-x-2">
                <button
                  onClick={handleDownloadPDF}
                  disabled={!isPdfReady || loading}
                  className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
                  Download PDF
                </button>
                {/*<button
                  onClick={handleEmailPDF}
                  disabled={!isPdfReady || loading}
                  className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
                  Email PDF
                </button>*/}
                <button onClick={onclose} className="flex items-center px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors">
                  <X/>
                  
                </button>
              </div>
            </div>

            {/* PDF Preview */}
            <div className="border rounded-lg p-4 bg-gray-50">
              {isPdfReady ? (
                <div className="relative">
                  <div className="overflow-auto max-h-[600px]">
                    <PDFDownloadLink
                      document={<AssetRegisterPDF assets={assets} customerName={customername} />}
                      fileName={`asset-register-${customername.replace(/\s+/g, "-").toLowerCase()}.pdf`}
                      className="hidden"
                    >
                      {({ blob, url, loading, error }) => (loading ? "Loading document..." : "Download PDF")}
                    </PDFDownloadLink>

                    {/* PDF Preview Placeholder */}
                    <div className="w-full bg-white shadow-lg rounded-md p-6">
                      <h3 className="text-lg font-bold mb-4">PDF Preview</h3>

                      {/* Group assets by equipment type for preview */}
                      {assets.length > 0 ? (
                        Object.entries(
                          assets.reduce(
                            (groups, asset) => {
                              const key = `${asset.equiptype} - ${asset.manufacturer} ${asset.model}`.trim()
                              if (!groups[key]) groups[key] = []
                              groups[key].push(asset)
                              return groups
                            },
                            {} as Record<string, AssetRegister[]>,
                          ),
                        ).map(([groupName, groupAssets]) => (
                          <div key={groupName} className="mb-6">
                            <h4 className="text-sm font-bold mb-2">Asset Register - {groupName.toUpperCase()}</h4>
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
                                  {groupAssets.map((asset) => {
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
                        ))
                      ) : (
                        <div className="text-center py-10">
                          <p className="text-gray-500">No assets found.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-teal-600" />
                    <p className="mt-2 text-gray-600">Preparing PDF...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Error: {error}</p>
            <p>Please try again later or contact support.</p>
          </div>
        )}
      </div>
    </div>
  )
}
