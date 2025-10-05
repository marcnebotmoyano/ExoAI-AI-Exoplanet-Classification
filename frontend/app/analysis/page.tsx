"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

type PredictionResult = {
  id: string
  prediction: "confirmed" | "candidate" | "false positive"
  probability: [number, number, number]
  confidence: number
}

type AnalysisData = {
  summary: {
    total: number
    confirmed: number
    candidate: number
    false_positive: number
    high_confidence: number
    column_importance: Record<string, number>
  }
  results: PredictionResult[]
}

export default function AnalysisPage() {
  const [data, setData] = useState<AnalysisData | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [activeFilter, setActiveFilter] = useState<"all" | "confirmed" | "candidate" | "false positive">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    const storedData = sessionStorage.getItem("analysisResults")
    const storedFileName = sessionStorage.getItem("fileName")
    if (storedData) {
      setData(JSON.parse(storedData))
    }
    if (storedFileName) {
      setFileName(storedFileName)
    }
  }, [])

  const filteredResults = useMemo(() => {
    if (!data) return []

    let filtered = data.results

    // Apply filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((result) => result.prediction === activeFilter)
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter((result) => result.id.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    return filtered
  }, [data, activeFilter, searchQuery])

  const paginatedResults = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    return filteredResults.slice(startIndex, startIndex + rowsPerPage)
  }, [filteredResults, currentPage, rowsPerPage])

  const totalPages = Math.ceil(filteredResults.length / rowsPerPage)

  const chartData = useMemo(() => {
    if (!data) return []

    const total = data.summary.total
    return [
      {
        name: "Confirmed",
        value: data.summary.confirmed,
        percentage: Math.round((data.summary.confirmed / total) * 100),
        color: "#22c55e",
      },
      {
        name: "Candidate",
        value: data.summary.candidate,
        percentage: Math.round((data.summary.candidate / total) * 100),
        color: "#f97316",
      },
      {
        name: "False Positive",
        value: data.summary.false_positive,
        percentage: Math.round((data.summary.false_positive / total) * 100),
        color: "#ef4444",
      },
    ]
  }, [data])

  const handleExport = () => {
    if (!data) return

    // Create CSV content
    const headers = [
      "ID",
      "Status",
      "Confidence",
      "Candidate Probability",
      "Confirmed Probability",
      "False Positive Probability",
    ]
    const rows = data.results.map((result) => [
      result.id,
      result.prediction,
      result.confidence.toFixed(2),
      (result.probability[0] * 100).toFixed(2) + "%",
      (result.probability[1] * 100).toFixed(2) + "%",
      (result.probability[2] * 100).toFixed(2) + "%",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${fileName.replace(".csv", "")}_analysis.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-300"
      case "candidate":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "false positive":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed"
      case "candidate":
        return "Candidate"
      case "false positive":
        return "False Positive"
      default:
        return status
    }
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a1628] text-white flex items-center justify-center">
        <p>Loading analysis results...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 border-b border-gray-800">
        <h1 className="text-3xl font-bold tracking-wide">EXO-AI</h1>
        <nav className="flex gap-16">
          <a href="/" className="text-sm tracking-wider text-gray-400 hover:text-white transition-colors">
            UPLOAD
          </a>
          <a href="/analysis" className="text-sm tracking-wider border-b-2 border-blue-500 pb-1">
            ANALYSIS
          </a>
          <a href="#" className="text-sm tracking-wider text-gray-400 hover:text-white transition-colors">
            ACCURACY
          </a>
        </nav>
      </header>

      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Filename and Export Button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-gray-400">{fileName}</h2>
            <Button
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <span className="text-xl">⬇</span>
              Export as Excel
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Confirmed Card */}
            <div className="bg-white rounded-lg p-6 border-4 border-green-500">
              <div className="text-5xl font-bold text-black mb-2">{data.summary.confirmed}</div>
              <div className="text-black font-medium">Confirmed</div>
            </div>

            {/* Candidate Card */}
            <div className="bg-white rounded-lg p-6 border-4 border-orange-500">
              <div className="text-5xl font-bold text-black mb-2">{data.summary.candidate}</div>
              <div className="text-black font-medium">Candidate</div>
              <div className="text-sm text-gray-600 mt-1">Since 140 score</div>
            </div>

            {/* False Positive Card */}
            <div className="bg-white rounded-lg p-6 border-4 border-red-500">
              <div className="text-5xl font-bold text-black mb-2">{data.summary.false_positive}</div>
              <div className="text-black font-medium">False Positive</div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg p-6">
            {/* Filter Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveFilter("all")}
                className={`pb-2 px-4 text-sm font-medium transition-colors ${
                  activeFilter === "all"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter("candidate")}
                className={`pb-2 px-4 text-sm font-medium transition-colors ${
                  activeFilter === "candidate"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Candidate
              </button>
              <button
                onClick={() => setActiveFilter("confirmed")}
                className={`pb-2 px-4 text-sm font-medium transition-colors ${
                  activeFilter === "confirmed"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Confirmed
              </button>
              <button
                onClick={() => setActiveFilter("false positive")}
                className={`pb-2 px-4 text-sm font-medium transition-colors ${
                  activeFilter === "false positive"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                False Positive
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-6 flex items-center gap-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-300 text-black"
                />
              </div>
              <Button variant="outline" className="text-blue-600 border-blue-600 hover:bg-blue-50 bg-transparent">
                Search
              </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Confidence</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Probability distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedResults.map((result, index) => {
                    const [candidateProb, confirmedProb, falsePositiveProb] = result.probability.map((p) => p * 100)
                    return (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-4 text-sm text-gray-900">{result.id}</td>
                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              result.prediction,
                            )}`}
                          >
                            {getStatusLabel(result.prediction)}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-900">{result.confidence.toFixed(1)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 w-full">
                            {/* Confirmed (Green) */}
                            {confirmedProb > 0 && (
                              <div
                                className="bg-green-600 h-8 flex items-center justify-center text-white text-xs font-medium"
                                style={{ width: `${confirmedProb}%` }}
                              >
                                {confirmedProb >= 10 && `${Math.round(confirmedProb)}%`}
                              </div>
                            )}
                            {/* Candidate (Orange) */}
                            {candidateProb > 0 && (
                              <div
                                className="bg-orange-500 h-8 flex items-center justify-center text-white text-xs font-medium"
                                style={{ width: `${candidateProb}%` }}
                              >
                                {candidateProb >= 10 && `${Math.round(candidateProb)}%`}
                              </div>
                            )}
                            {/* False Positive (Red) */}
                            {falsePositiveProb > 0 && (
                              <div
                                className="bg-red-600 h-8 flex items-center justify-center text-white text-xs font-medium"
                                style={{ width: `${falsePositiveProb}%` }}
                              >
                                {falsePositiveProb >= 10 && `${Math.round(falsePositiveProb)}%`}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-black"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700"
                  >
                    ›
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-96 p-8 space-y-6">
          {/* Accuracy Section */}
          <div className="bg-white rounded-lg p-6">
            <h3 className="text-xl font-bold text-black mb-4">ACCURACY</h3>
            <p className="text-sm text-gray-700 mb-6">
              Our system is trained on NASA's open-source datasets, leveraging key astrophysical parameters to ensure
              analytical accuracy and model reliability across the following dimensions:
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-2xl font-bold text-black">1</span>
                <span className="text-sm text-gray-700">Orbital period</span>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl font-bold text-black">2</span>
                <span className="text-sm text-gray-700">Transit depth and duration</span>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl font-bold text-black">3</span>
                <span className="text-sm text-gray-700">Planetary radius and mass</span>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl font-bold text-black">4</span>
                <span className="text-sm text-gray-700">Flux variations and light curve morphology</span>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl font-bold text-black">5</span>
                <span className="text-sm text-gray-700">Signal-to-noise ratio (SNR)</span>
              </div>
            </div>
            <button className="mt-6 text-sm text-blue-600 hover:underline">Learn more</button>
          </div>

          <div className="bg-white rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-black">STATISTICS</h3>
              <button className="text-gray-400 hover:text-gray-600">⋮</button>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-gray-700">
                    {item.value} {item.name.toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
