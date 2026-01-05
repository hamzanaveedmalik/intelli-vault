import { env } from "~/env";
import { DeepgramTranscriptionProvider } from "./deepgram";
import { AssemblyAITranscriptionProvider } from "./assemblyai";
import type {
  Transcript,
  TranscriptionProvider,
  TranscriptionOptions,
  TranscriptionResult,
} from "./types";

/**
 * Get transcription provider instance based on environment configuration
 */
function getTranscriptionProvider(): DeepgramTranscriptionProvider | AssemblyAITranscriptionProvider {
  const provider = (env.TRANSCRIPTION_PROVIDER || "deepgram") as TranscriptionProvider;

  if (provider === "deepgram") {
    const apiKey = env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPGRAM_API_KEY environment variable is required");
    }
    return new DeepgramTranscriptionProvider(apiKey);
  }

  if (provider === "assemblyai") {
    const apiKey = env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      throw new Error("ASSEMBLYAI_API_KEY environment variable is required");
    }
    return new AssemblyAITranscriptionProvider(apiKey);
  }

  throw new Error(`Unsupported transcription provider: ${provider}`);
}

/**
 * Transcribe audio file with retry logic
 * Implements exponential backoff with max 3 retries (NFR65)
 */
export async function transcribeAudio(
  audioUrl: string,
  options: TranscriptionOptions = {}
): Promise<TranscriptionResult> {
  const provider = getTranscriptionProvider();
  const providerName = env.TRANSCRIPTION_PROVIDER || "deepgram";
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const startTime = Date.now();
      const transcript = await provider.transcribe(audioUrl, options);
      const processingTime = (Date.now() - startTime) / 1000;

      return {
        transcript,
        provider: providerName as TranscriptionProvider,
        processingTime,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on certain errors (authentication, invalid URL, etc.)
      if (
        lastError.message.includes("401") ||
        lastError.message.includes("403") ||
        lastError.message.includes("404") ||
        lastError.message.includes("Invalid")
      ) {
        throw lastError;
      }

      // Exponential backoff: wait 2^attempt seconds
      if (attempt < maxRetries - 1) {
        const delayMs = Math.pow(2, attempt) * 1000;
        console.warn(
          `Transcription attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`,
          lastError.message
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  // All retries exhausted
  throw new Error(
    `Transcription failed after ${maxRetries} attempts: ${lastError?.message || "Unknown error"}`
  );
}

/**
 * Export types for use in other modules
 */
export type {
  Transcript,
  TranscriptSegment,
  TranscriptionProvider,
  TranscriptionOptions,
  TranscriptionResult,
} from "./types";

