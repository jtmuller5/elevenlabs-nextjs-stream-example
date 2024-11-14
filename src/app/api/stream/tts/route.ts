// route.ts

import { ElevenLabsClient } from "elevenlabs";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY!,
  });

  try {
    // Parse the request body to get the text
    const { text } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const audioStream = await elevenlabs.generate({
            stream: true,
            voice: "Jessica",
            text: text,
            model_id: "eleven_turbo_v2_5",
            output_format: "mp3_44100_64",
          });

          // Read the audio stream and enqueue chunks
          for await (const chunk of audioStream) {
            controller.enqueue(chunk);
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
}
