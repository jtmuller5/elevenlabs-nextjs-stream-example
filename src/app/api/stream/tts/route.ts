// route.ts

import { ElevenLabsClient } from "elevenlabs";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const elevenlabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY!,
  });

  try {
    // Parse the request body to get the text and voiceId
    const { text, voice } = await req.json();

    if (!text) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Default voiceId if not provided
    const defaultVoice = ELEVENLABS_VOICES.find(
      (voice) => voice.name === "Jessica"
    )?.id;

    const selectedVoice = voice || defaultVoice;

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const audioStream = await elevenlabs.textToSpeech.convertAsStream(
            selectedVoice,
            {
              text: text,
              model_id: "eleven_turbo_v2_5",
              output_format: "mp3_44100_64",
            }
          );

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

interface Voice {
  id: string; // e.g. 'Xb7hH8MSUJpSbSDYk0k2'
  name: string; // e.g. 'Alice'
  accent: string; // e.g. 'English (US)'
  gender: "Male" | "Female";
  provider: "deepgram" | "elevenlabs";
}

const ELEVENLABS_VOICES: Voice[] = [
  {
    id: "Xb7hH8MSUJpSbSDYk0k2",
    name: "Alice",
    accent: "British",
    gender: "Female",
    provider: "elevenlabs",
  },
  {
    id: "9BWtsMINqrJLrRacOk9x",
    name: "Aria",
    accent: "American",
    gender: "Female",
    provider: "elevenlabs",
  },
  {
    id: "pqHfZKP75CvOlQylNhV4",
    name: "Bill",
    accent: "American",
    gender: "Male",
    provider: "elevenlabs",
  },
  {
    id: "nPczCjzI2devNBz1zQrb",
    name: "Brian",
    accent: "American",
    gender: "Male",
    provider: "elevenlabs",
  },
  {
    id: "N2lVS1w4EtoT3dr4eOWO",
    name: "Callum",
    accent: "Transatlantic",
    gender: "Male",
    provider: "elevenlabs",
  },
  {
    id: "IKne3meq5aSn9XLyUdCD",
    name: "Charlie",
    accent: "Australian",
    gender: "Male",
    provider: "elevenlabs",
  },
  {
    id: "XB0fDUnXU5powFXDhCwa",
    name: "Charlotte",
    accent: "Swedish",
    gender: "Female",
    provider: "elevenlabs",
  },
  {
    id: "iP95p4xoKVk53GoZ742B",
    name: "Chris",
    accent: "American",
    gender: "Male",
    provider: "elevenlabs",
  },
  {
    id: "onwK4e9ZLuTAKqWW03F9",
    name: "Daniel",
    accent: "British",
    gender: "Male",
    provider: "elevenlabs",
  },
  {
    id: "cjVigY5qzO86Huf0OWal",
    name: "Eric",
    accent: "American",
    gender: "Male",
    provider: "elevenlabs",
  },
  {
    id: "JBFqnCBsd6RMkjVDRZzb",
    name: "George",
    accent: "British",
    gender: "Male",
    provider: "elevenlabs",
  },
  {
    id: "cgSgspJ2msm6clMCkdW9",
    name: "Jessica",
    accent: "American",
    gender: "Female",
    provider: "elevenlabs",
  },
  {
    id: "FGY2WhTYpPnrIDTdsKH5",
    name: "Laura",
    accent: "American",
    gender: "Female",
    provider: "elevenlabs",
  },
  {
    id: "TX3LPaxmHKxFdv7VOQHJ",
    name: "Liam",
    accent: "American",
    gender: "Male",
    provider: "elevenlabs",
  },
  {
    id: "pFZP5JQG7iQjIQuC4Bku",
    name: "Lily",
    accent: "British",
    gender: "Female",
    provider: "elevenlabs",
  },
  {
    id: "XrExE9yKIg1WjnnlVkGX",
    name: "Matilda",
    accent: "American",
    gender: "Female",
    provider: "elevenlabs",
  },
  {
    id: "CwhRBWXzGAHq8TQ4Fs17",
    name: "Roger",
    accent: "American",
    gender: "Male",
    provider: "elevenlabs",
  },
  {
    id: "EXAVITQu4vr4xnSDxMaL",
    name: "Sarah",
    accent: "American",
    gender: "Female",
    provider: "elevenlabs",
  },
  {
    id: "bIHbv24MWmeRgasZH58o",
    name: "Will",
    accent: "American",
    gender: "Male",
    provider: "elevenlabs",
  },
];
