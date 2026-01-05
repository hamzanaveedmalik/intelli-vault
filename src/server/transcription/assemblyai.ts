import type {
  Transcript,
  TranscriptSegment,
  TranscriptionOptions,
} from "./types";

/**
 * AssemblyAI transcription provider
 * Documentation: https://www.assemblyai.com/docs/
 */
export class AssemblyAITranscriptionProvider {
  private apiKey: string;
  private baseUrl = "https://api.assemblyai.com/v2";

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("AssemblyAI API key is required");
    }
    this.apiKey = apiKey;
  }

  /**
   * Transcribe audio file from URL
   */
  async transcribe(
    audioUrl: string,
    options: TranscriptionOptions = {}
  ): Promise<Transcript> {
    const {
      language = "en",
      speakerDiarization = true,
      punctuate = true,
    } = options;

    // Step 1: Submit transcription job
    const submitResponse = await fetch(`${this.baseUrl}/transcript`, {
      method: "POST",
      headers: {
        authorization: this.apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language_code: language,
        speaker_labels: speakerDiarization,
        auto_punctuation: punctuate,
        format_text: true, // Automatic formatting
      }),
    });

    if (!submitResponse.ok) {
      const error = await submitResponse.json().catch(() => ({}));
      throw new Error(
        `AssemblyAI transcription submission failed: ${submitResponse.status} ${submitResponse.statusText} - ${JSON.stringify(error)}`
      );
    }

    const { id } = await submitResponse.json();

    if (!id) {
      throw new Error("AssemblyAI did not return a transcript ID");
    }

    // Step 2: Poll for completion
    const transcript = await this.pollForCompletion(id);

    return this.parseAssemblyAIResponse(transcript);
  }

  /**
   * Poll for transcription completion
   */
  private async pollForCompletion(
    transcriptId: string,
    maxAttempts = 60,
    delayMs = 2000
  ): Promise<any> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(
        `${this.baseUrl}/transcript/${transcriptId}`,
        {
          headers: {
            authorization: this.apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `AssemblyAI polling failed: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      if (data.status === "completed") {
        return data;
      }

      if (data.status === "error") {
        throw new Error(
          `AssemblyAI transcription failed: ${data.error || "Unknown error"}`
        );
      }

      // Status is "queued" or "processing", wait and retry
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    throw new Error(
      `AssemblyAI transcription timed out after ${maxAttempts} attempts`
    );
  }

  /**
   * Parse AssemblyAI API response into our Transcript format
   */
  private parseAssemblyAIResponse(data: any): Transcript {
    const segments: TranscriptSegment[] = [];

    if (!data.utterances || data.utterances.length === 0) {
      // Fallback to words if utterances not available
      const words = data.words || [];
      if (words.length === 0) {
        throw new Error("Invalid AssemblyAI response: no utterances or words found");
      }

      // Group words into segments
      let currentSegment: TranscriptSegment | null = null;

      for (const word of words) {
        const speaker = word.speaker || "A";
        const speakerLabel = `Speaker ${speaker}`;
        const startTime = word.start / 1000; // Convert ms to seconds
        const endTime = word.end / 1000;
        const text = word.text || "";

        if (
          !currentSegment ||
          currentSegment.speaker !== speakerLabel ||
          startTime - (currentSegment.endTime || 0) > 2 // New segment if gap > 2 seconds
        ) {
          if (currentSegment) {
            segments.push(currentSegment);
          }
          currentSegment = {
            startTime,
            endTime,
            speaker: speakerLabel,
            text: text,
          };
        } else {
          // Append to current segment
          currentSegment.text += " " + text;
          currentSegment.endTime = endTime;
        }
      }

      if (currentSegment) {
        segments.push(currentSegment);
      }
    } else {
      // Use utterances (better format)
      for (const utterance of data.utterances) {
        const speaker = utterance.speaker || "A";
        const startTime = utterance.start / 1000; // Convert ms to seconds
        const endTime = utterance.end / 1000;
        const text = utterance.text || "";

        segments.push({
          startTime,
          endTime,
          speaker: `Speaker ${speaker}`,
          text: text.trim(),
        });
      }
    }

    return {
      segments,
      duration: data.audio_duration ? data.audio_duration / 1000 : undefined, // Convert ms to seconds
    };
  }
}

