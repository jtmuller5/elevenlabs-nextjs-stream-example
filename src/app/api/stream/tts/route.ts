// route.ts

import { ElevenLabsClient } from "elevenlabs";

export async function GET() {
  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
  });

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const audioStream = await elevenlabs.generate({
          stream: true,
          voice: "Jessica",
          text: "This is a... streaming voice",
          model_id: "eleven_turbo_v2_5",
          output_format: "mp3_44100_64", // Changed to "mp3_44100_64"
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
      "Content-Type": "audio/mpeg", // Ensure this matches the output format
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}