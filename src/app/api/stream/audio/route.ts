import { readFile } from "fs/promises";
import { join } from "path";

export async function GET() {
  // In a real app, you might get this from a database or external service
  const audioPath = join(process.cwd(), "public", "audio.mp3");

  // Set chunk size (64KB)
  const CHUNK_SIZE = 64 * 1024;

  const readable = new ReadableStream({
    async start(controller) {
      try {
        const audioData = await readFile(audioPath);
        let offset = 0;

        while (offset < audioData.length) {
          const chunk = audioData.slice(offset, offset + CHUNK_SIZE);
          controller.enqueue(chunk);
          offset += CHUNK_SIZE;

          // Optional: Add small delay to prevent overwhelming the client
          await new Promise((resolve) => setTimeout(resolve, 50));
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
}
