export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a1628] text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p>Loading metrics...</p>
      </div>
    </div>
  )
}
