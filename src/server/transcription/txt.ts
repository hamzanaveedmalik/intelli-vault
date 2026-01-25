import type { Transcript, TranscriptSegment } from "./types";

const TIMESTAMP_PATTERN = /\[(\d{2}):(\d{2}):(\d{2})\]/;

function parseTimestampToSeconds(value: string): number {
  const match = value.match(TIMESTAMP_PATTERN);
  if (!match) {
    return 0;
  }
  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}

function normalizeLine(line: string): string {
  return line.replace(/\*\*/g, "").trim();
}

export function parseTranscriptText(transcriptText: string): Transcript {
  const lines = transcriptText.split(/\r?\n/);
  const segments: TranscriptSegment[] = [];
  let currentTimestamp = 0;

  for (const rawLine of lines) {
    const line = normalizeLine(rawLine);
    if (!line) {
      continue;
    }

    if (TIMESTAMP_PATTERN.test(line)) {
      currentTimestamp = parseTimestampToSeconds(line);
      continue;
    }

    const speakerMatch = line.match(/^([^:]+):\s*(.+)$/);
    if (speakerMatch) {
      const speaker = speakerMatch[1]?.trim() || "Unknown";
      const text = speakerMatch[2]?.trim() || "";
      if (text) {
        segments.push({
          startTime: currentTimestamp,
          endTime: currentTimestamp,
          speaker,
          text,
        });
      }
      continue;
    }

    if (segments.length > 0) {
      segments[segments.length - 1] = {
        ...segments[segments.length - 1]!,
        text: `${segments[segments.length - 1]!.text} ${line}`.trim(),
      };
    }
  }

  for (let i = 0; i < segments.length; i += 1) {
    const next = segments[i + 1];
    const endTime = next ? Math.max(next.startTime, segments[i]!.startTime + 5) : segments[i]!.startTime + 30;
    segments[i] = { ...segments[i]!, endTime };
  }

  const duration = segments.length > 0 ? segments[segments.length - 1]!.endTime : 0;
  return { segments, duration };
}
