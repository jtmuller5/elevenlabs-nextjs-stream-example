import { NextResponse } from 'next/server'

export async function GET() {
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const messages = [
          "👋 Hello from the stream!",
          "🚀 Loading your data...",
          "📦 Processing items...",
          "✨ Almost there...",
          "✅ Stream complete!"
        ]

        for (const message of messages) {
          controller.enqueue(encoder.encode(message + '\n'))
          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      } catch (error) {
        controller.error(error)
      } finally {
        controller.close()
      }
    }
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}