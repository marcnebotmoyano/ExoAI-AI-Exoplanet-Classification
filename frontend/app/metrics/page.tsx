"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Clock, Grid3x3, Sparkles, Check } from "lucide-react"

type ModelMetrics = {
  model_name: string
  classes: string[]
  features: string[] | null
  feature_importances: Record<string, number>
  accuracy: number
  last_trained: string
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<ModelMetrics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("http://localhost:8000/exoplanet/metrics")
        if (!response.ok) {
          throw new Error("Failed to fetch metrics")
        }
        const data = await response.json()
        setMetrics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  const getTopFeatures = (featureImportances: Record<string, number>, count = 5) => {
    return Object.entries(featureImportances)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([feature]) => feature)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  const getModelInfo = (modelName: string) => {
    if (modelName.includes("kepler")) {
      return {
        displayName: "Kepler",
        description: "They refer to the measurements of their physical and orbital properties (93.5% accuracy)",
        bgColor: "bg-[#f5f1e8]",
        textColor: "text-gray-800",
        buttonStyle: "border-2 border-gray-800 text-gray-800 hover:bg-gray-100",
        iconColor: "text-blue-600",
      }
    } else {
      return {
        displayName: "K2",
        description: "They are derived from the transit photometry method (90.8% accuracy)",
        bgColor: "bg-blue-600",
        textColor: "text-white",
        buttonStyle: "bg-white text-blue-600 hover:bg-gray-100",
        iconColor: "text-blue-400",
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a1628] text-white flex items-center justify-center">
        <p>Loading metrics...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a1628] text-white flex items-center justify-center">
        <p className="text-red-400">Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a1628] text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6">
        <h1 className="text-3xl font-bold tracking-wide">EXO-AI</h1>
        <nav className="flex gap-16">
          <a href="/" className="text-sm tracking-wider text-gray-400 hover:text-white transition-colors">
            UPLOAD
          </a>
          <a href="/analysis" className="text-sm tracking-wider text-gray-400 hover:text-white transition-colors">
            ANALYSIS
          </a>
          <a href="/metrics" className="text-sm tracking-wider border-b-2 border-blue-500 pb-1">
            METRICS
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-8 py-16">
        {/* Title Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-light mb-4 tracking-wide">Know your metric model</h2>
          <p className="text-gray-400 text-lg">Performance metrics for model trained exoplanet detection models</p>
        </div>

        {/* Model Cards */}
        <div className="grid grid-cols-2 gap-8">
          {metrics.map((model) => {
            const info = getModelInfo(model.model_name)
            const topFeatures = getTopFeatures(model.feature_importances)
            const featureCount = Object.keys(model.feature_importances).length

            return (
              <div key={model.model_name} className={`${info.bgColor} ${info.textColor} rounded-2xl p-8 shadow-xl`}>
                {/* Model Name */}
                <h3 className="text-3xl font-bold mb-4">{info.displayName}</h3>

                {/* Description */}
                <p className="text-sm mb-8 opacity-80">{info.description}</p>

                {/* Last Trained */}
                <div className="flex items-start gap-3 mb-6">
                  <Clock className={`w-5 h-5 mt-0.5 ${info.iconColor}`} />
                  <div>
                    <p className="text-sm font-medium opacity-70">Last trained:</p>
                    <p className="text-sm font-semibold">{formatDate(model.last_trained)}</p>
                  </div>
                </div>

                {/* Classification */}
                <div className="flex items-start gap-3 mb-6">
                  <Grid3x3 className={`w-5 h-5 mt-0.5 ${info.iconColor}`} />
                  <div>
                    <p className="text-sm font-medium opacity-70">Classification:</p>
                    <p className="text-sm font-semibold">Confirmed, candidate and false positive</p>
                  </div>
                </div>

                {/* Features */}
                <div className="flex items-start gap-3 mb-8">
                  <Sparkles className={`w-5 h-5 mt-0.5 ${info.iconColor}`} />
                  <div>
                    <p className="text-sm font-medium opacity-70">Features:</p>
                    <p className="text-sm font-semibold">{featureCount} features</p>
                  </div>
                </div>

                {/* Most Important Features */}
                <div className="mb-8">
                  <p className="text-sm font-bold mb-4">Most important features:</p>
                  <div className="space-y-2">
                    {topFeatures.map((feature) => (
                      <div key={feature} className="flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Try Button */}
                <Button
                  onClick={() => router.push("/")}
                  className={`w-full py-6 text-base rounded-lg ${info.buttonStyle}`}
                  variant="outline"
                >
                  Try
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
