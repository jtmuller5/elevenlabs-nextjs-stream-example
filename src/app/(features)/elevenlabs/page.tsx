"use client";
import { useEffect, useRef, useState } from "react";

export default function AudioStreamingPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("This is an example message");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startAudioStream = async () => {
    if (!message.trim()) {
      setError("Please enter a message.");
      return;
    }

    try {
      setIsPlaying(true);
      setError(null);

      // Create a new AbortController to allow cancellation
      const abortController = new AbortController();

      const response = await fetch("/api/stream/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: message }),
        signal: abortController.signal,
      });

      if (!response.body) {
        throw new Error("No response body");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An error occurred");
      }

      // Create a blob from the response stream
      const contentType = response.headers.get("Content-Type") || "audio/mpeg";
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        chunks.push(value);
      }

      // Combine chunks into a single blob
      const blob = new Blob(chunks, { type: contentType });
      const audioUrl = URL.createObjectURL(blob);

      // Play the audio
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play();
      }

      // Cleanup
      audioRef.current?.addEventListener("ended", () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      });
    } catch (err) {
      if ((err as any).name === "AbortError") {
        // Fetch aborted
        return;
      }
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setIsPlaying(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Text-to-Speech Streaming Demo</h1>

      <div className="space-y-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message here..."
          className="w-full p-2 border rounded"
          rows={4}
          disabled={isPlaying}
        />

        <button
          onClick={isPlaying ? stopAudio : startAudioStream}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                     disabled:bg-blue-300 disabled:cursor-not-allowed"
          disabled={isPlaying && !message}
        >
          {isPlaying ? "Stop Audio" : "Play Audio"}
        </button>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
        )}
      </div>

      <audio ref={audioRef} hidden />
    </main>
  );
}
