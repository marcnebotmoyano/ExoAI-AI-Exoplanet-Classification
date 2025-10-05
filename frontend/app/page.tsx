"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function ExoAIPage() {
  const [selectedModel, setSelectedModel] = useState<"Kepler" | "K2/TESS">("Kepler")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        setError("Please select a CSV file")
        return
      }
      if (file.size > 25 * 1024 * 1024) {
        setError("File size must be less than 25 MB")
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        setError("Please select a CSV file")
        return
      }
      if (file.size > 25 * 1024 * 1024) {
        setError("File size must be less than 25 MB")
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select a file first")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const modelString = selectedModel === "Kepler" ? "kepler" : "k2"; // "kepler" o "k2"

      const formData = new FormData();
      formData.append("file", selectedFile); // El archivo que se envía

      const response = await fetch(`http://localhost:8000/exoplanet/predict?model=${modelString}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to analyze file")
      }

      const data = await response.json()

      sessionStorage.setItem("analysisResults", JSON.stringify(data))
      sessionStorage.setItem("fileName", selectedFile.name)
      router.push("/analysis")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during analysis")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <h1 className="text-3xl font-bold tracking-wide">EXO-AI</h1>
        <nav className="flex gap-16">
          <a href="#" className="text-sm tracking-wider border-b-2 border-blue-500 pb-1">
            UPLOAD
          </a>
          <a href="#" className="text-sm tracking-wider text-gray-400 hover:text-white transition-colors">
            ANALYSIS
          </a>
          <a href="#" className="text-sm tracking-wider text-gray-400 hover:text-white transition-colors">
            METRICS
          </a>
        </nav>
      </header>

      {/* Hero Section with Planet */}
      <div className="relative flex flex-col items-center pt-4 pb-12">
        <div className="w-full max-w-3xl h-80 relative mb-8 overflow-hidden">
          <img src="/planet.jpg" alt="Exoplanet" className="w-full h-full object-cover object-top" />
          {/* Radial gradient overlay to fade edges */}
          <div
            className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#0a1628] pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 30%, rgba(10, 22, 40, 0.3) 50%, rgba(10, 22, 40, 0.7) 70%, #0a1628 90%)",
            }}
          />
        </div>

        <h2 className="text-4xl font-light text-center tracking-wide max-w-4xl px-4">
          UPLOAD YOUR FILE AND COMPUTE
          <br />
          EXOPLANET PROBABILITIES
        </h2>
      </div>

      {/* Process Steps */}
      <div className="max-w-6xl mx-auto px-8 mb-16">
        <div className="grid grid-cols-4 gap-8 relative">
          {/* Connecting Lines */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gray-700 -translate-y-1/2 z-0" />

          {/* Step 1 */}
          <div className="relative z-10">
            <div className="text-6xl font-light mb-4">1</div>
            <div className="bg-[#1a2942] rounded-lg p-6 h-32 flex items-center justify-center border border-gray-800">
              <p className="text-sm text-center">Check your format file</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative z-10">
            <div className="text-6xl font-light mb-4">2</div>
            <div className="bg-[#1a2942] rounded-lg p-6 h-32 flex items-center justify-center border border-gray-800">
              <p className="text-sm text-center">Upload your file according your machine learning model</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative z-10">
            <div className="text-6xl font-light mb-4">3</div>
            <div className="bg-[#1a2942] rounded-lg p-6 h-32 flex items-center justify-center border border-gray-800">
              <p className="text-sm text-center">Obtain your analysis</p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="relative z-10">
            <div className="text-6xl font-light mb-4">4</div>
            <div className="bg-[#1a2942] rounded-lg p-6 h-32 flex items-center justify-center border border-gray-800">
              <p className="text-sm text-center">Export your file</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="max-w-2xl mx-auto px-8 pb-16">
        <div className="bg-[#0f1a2e] rounded-lg p-8 border border-gray-800">
          <p className="text-sm mb-4 text-gray-300">Select the machine learning model of your file:</p>

          {/* Model Selector */}
          <div className="bg-[#1a2942] rounded-full p-1 mb-6 w-full flex">
            <button
              onClick={() => setSelectedModel("Kepler")}
              className={`flex-1 py-3 text-sm rounded-full transition-colors ${
                selectedModel === "Kepler" ? "bg-[#0f1a2e] text-white shadow-lg" : "text-gray-400 hover:text-white"
              }`}
            >
              Kepler
            </button>
            <button
              onClick={() => setSelectedModel("K2/TESS")}
              className={`flex-1 py-3 text-sm rounded-full transition-colors ${
                selectedModel === "K2/TESS" ? "bg-[#0f1a2e] text-white shadow-lg" : "text-gray-400 hover:text-white"
              }`}
            >
              K2/TESS
            </button>
          </div>

          {/* Upload Area */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-blue-600 rounded-lg p-16 mb-4 bg-[#0a1628] flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors relative"
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-16 h-16 mb-4 relative pointer-events-none">
              <svg viewBox="0 0 64 64" className="w-full h-full">
                <rect x="8" y="16" width="48" height="40" rx="4" fill="#4a7ba7" />
                <rect x="8" y="12" width="48" height="8" rx="2" fill="#5a8bb7" />
                <circle cx="32" cy="36" r="12" fill="#2d5a8a" />
                <path
                  d="M32 30 L32 42 M26 36 L32 30 L38 36"
                  stroke="white"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-400 pointer-events-none">
              {selectedFile ? selectedFile.name : "Click here to upload or drop files here"}
            </p>
          </div>

          {/* File Info */}
          <div className="flex justify-between text-xs text-gray-500 mb-6">
            <span>Supported files: CSV</span>
            <span>Maximum file size: 25 MB</span>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm">{error}</div>
          )}

          {/* Analyze Button */}
          <Button
            onClick={handleAnalyze}
            disabled={!selectedFile || isUploading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Analyzing..." : "Analize"}
          </Button>
        </div>
      </div>
    </div>
  )
}
