"use client";

import type { TranscriptSegment } from "~/server/transcription/types";

interface TranscriptViewerProps {
  segments: TranscriptSegment[];
}

export default function TranscriptViewer({ segments }: TranscriptViewerProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSegmentClick = (startTime: number) => {
    // Dispatch custom event to set timestamp in editable fields
    window.dispatchEvent(
      new CustomEvent("setTimestamp", {
        detail: { timestamp: startTime },
      })
    );
  };

  if (!segments || segments.length === 0) {
    return (
      <div className="rounded-md bg-muted p-4">
        <p className="text-sm text-muted-foreground">
          Transcript is not available yet. Please check back in a few moments.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[600px] space-y-4 overflow-y-auto">
      {segments.map((segment, index) => (
        <div
          key={index}
          data-timestamp={Math.floor(segment.startTime)}
          data-segment-start={segment.startTime}
          className="border-l-4 border-primary pl-4 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => handleSegmentClick(segment.startTime)}
          title="Click to use this timestamp when adding/editing items"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">{formatTime(segment.startTime)}</span>
            <span className="text-muted-foreground/50">•</span>
            <span className="font-medium text-primary">{segment.speaker}</span>
          </div>
          <p className="mt-1 text-sm">{segment.text}</p>
        </div>
      ))}
    </div>
  );
}

