"use client";
import { useEffect, useRef, useState } from "react";

export default function AudioStreamingPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodesRef = useRef<AudioBufferSourceNode[]>([]);

  const startAudioStream = async () => {
    try {
      setIsPlaying(true);
      setError(null);
      setProgress(0);

      // Initialize Web Audio API
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      const response = await fetch("/api/stream/tts");
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error("Failed to get stream reader");
      }

      // Store chunks to combine them later
      const chunks: Uint8Array[] = [];

      // Read stream
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        chunks.push(value);

        // Update progress (approximate since we don't know total size)
        setProgress(chunks.length * 64 * 1024); // 64KB chunks
      }

      // Combine all chunks into a single array
      const combinedChunks = new Uint8Array(
        chunks.reduce((acc, chunk) => acc + chunk.length, 0)
      );

      let offset = 0;
      chunks.forEach((chunk) => {
        combinedChunks.set(chunk, offset);
        offset += chunk.length;
      });

      // Decode audio data
      const audioBuffer = await audioContextRef.current.decodeAudioData(
        combinedChunks.buffer
      );

      // Create and start audio source
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start(0);

      // Store source node for cleanup
      sourceNodesRef.current.push(source);

      // Handle completion
      source.onended = () => {
        setIsPlaying(false);
        setProgress(0);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    sourceNodesRef.current.forEach((source) => {
      try {
        source.stop();
      } catch (e) {
        // Ignore errors if source already stopped
      }
    });
    sourceNodesRef.current = [];
    setIsPlaying(false);
    setProgress(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current?.state !== "closed") {
        audioContextRef.current?.close();
      }
    };
  }, []);

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Audio Streaming Demo</h1>

      <div className="space-y-4">
        <button
          onClick={isPlaying ? stopAudio : startAudioStream}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 
                     disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {isPlaying ? "Stop Audio" : "Play Audio"}
        </button>

        {progress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((progress / (1024 * 1024)) * 100, 100)}%`,
              }}
            />
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
        )}
      </div>
    </main>
  );
}
