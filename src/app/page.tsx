'use client'
import { useEffect, useState } from 'react'

export default function StreamingPage() {
  const [messages, setMessages] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startStream = async () => {
    setIsStreaming(true)
    setMessages([])
    setError(null)

    try {
      const response = await fetch('/api/stream')
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Failed to get stream reader')
      }

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        setMessages(prev => [...prev, text.trim()])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Next.js Streaming Demo</h1>
      
      <button
        onClick={startStream}
        disabled={isStreaming}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
      >
        {isStreaming ? 'Streaming...' : 'Start Stream'}
      </button>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-2">
        {messages.map((message, index) => (
          <div 
            key={index}
            className="p-4 bg-gray-100 rounded shadow animate-fade-in"
          >
            {message}
          </div>
        ))}
      </div>
    </main>
  )
}