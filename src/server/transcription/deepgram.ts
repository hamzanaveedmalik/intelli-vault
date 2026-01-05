import type {
  Transcript,
  TranscriptSegment,
  TranscriptionOptions,
} from "./types";

/**
 * Deepgram transcription provider
 * Documentation: https://developers.deepgram.com/
 */
export class DeepgramTranscriptionProvider {
  private apiKey: string;
  private baseUrl = "https://api.deepgram.com/v1";

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Deepgram API key is required");
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
      language = "en-US",
      speakerDiarization = true,
      punctuate = true,
      paragraphs = false,
    } = options;

    const params = new URLSearchParams({
      model: "nova-2", // Latest model
      language,
      punctuate: punctuate.toString(),
      paragraphs: paragraphs.toString(),
      diarize: speakerDiarization.toString(),
      smart_format: "true", // Automatic formatting
    });

    const response = await fetch(
      `${this.baseUrl}/listen?${params.toString()}`,
      {
        method: "POST",
        headers: {
          Authorization: `Token ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: audioUrl,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(
        `Deepgram transcription failed: ${response.status} ${response.statusText} - ${JSON.stringify(error)}`
      );
    }

    const data = await response.json();
    return this.parseDeepgramResponse(data);
  }

  /**
   * Parse Deepgram API response into our Transcript format
   */
  private parseDeepgramResponse(data: any): Transcript {
    const segments: TranscriptSegment[] = [];
    const results = data.results;

    if (!results || !results.channels || results.channels.length === 0) {
      throw new Error("Invalid Deepgram response: no channels found");
    }

    const channel = results.channels[0];
    const alternatives = channel.alternatives;

    if (!alternatives || alternatives.length === 0) {
      throw new Error("Invalid Deepgram response: no alternatives found");
    }

    const alternative = alternatives[0];
    const words = alternative.words || [];
    const paragraphs = alternative.paragraphs?.paragraphs || [];

    // If paragraphs are available, use them (better for readability)
    if (paragraphs.length > 0) {
      for (const paragraph of paragraphs) {
        const speaker = paragraph.speaker || paragraph.speaker || "Speaker 1";
        const startTime = paragraph.start || 0;
        const endTime = paragraph.end || 0;
        const text = paragraph.sentences
          ?.map((s: any) => s.text)
          .join(" ") || paragraph.text || "";

        segments.push({
          startTime,
          endTime,
          speaker: `Speaker ${speaker}`,
          text: text.trim(),
        });
      }
    } else if (words.length > 0) {
      // Fallback to words if paragraphs not available
      // Group words into segments by speaker
      let currentSegment: TranscriptSegment | null = null;

      for (const word of words) {
        const speaker = word.speaker || 0;
        const speakerLabel = `Speaker ${speaker + 1}`;
        const startTime = word.start || 0;
        const endTime = word.end || 0;
        const text = word.punctuated_word || word.word || "";

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
      throw new Error("Invalid Deepgram response: no words or paragraphs found");
    }

    return {
      segments,
      duration: results.metadata?.duration || undefined,
    };
  }
}

