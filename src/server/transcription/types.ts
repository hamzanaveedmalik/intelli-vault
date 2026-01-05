/**
 * Transcription segment with timestamp and speaker information
 */
export interface TranscriptSegment {
  startTime: number; // Start time in seconds
  endTime: number; // End time in seconds
  speaker: string; // Speaker label (e.g., "Speaker 1", "Speaker 2")
  text: string; // Transcript text for this segment
}

/**
 * Complete transcript with all segments
 */
export interface Transcript {
  segments: TranscriptSegment[];
  duration?: number; // Total duration in seconds (optional)
}

/**
 * Transcription provider configuration
 */
export type TranscriptionProvider = "deepgram" | "assemblyai";

/**
 * Transcription options
 */
export interface TranscriptionOptions {
  language?: string; // Language code (e.g., "en-US")
  speakerDiarization?: boolean; // Enable speaker diarization
  punctuate?: boolean; // Add punctuation
  paragraphs?: boolean; // Return paragraphs instead of segments
}

/**
 * Transcription result
 */
export interface TranscriptionResult {
  transcript: Transcript;
  provider: TranscriptionProvider;
  processingTime?: number; // Time taken to process (seconds)
}

