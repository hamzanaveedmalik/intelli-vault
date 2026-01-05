"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription } from "~/components/ui/alert";

interface ReprocessButtonProps {
  meetingId: string;
  hasTranscript: boolean;
  hasExtraction: boolean;
}

export default function ReprocessButton({
  meetingId,
  hasTranscript,
  hasExtraction,
}: ReprocessButtonProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only show button if meeting has transcript
  if (!hasTranscript) {
    return null;
  }

  const handleReprocess = async () => {
    if (!confirm("Are you sure you want to reprocess extraction for this meeting? This will overwrite any existing extraction data.")) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(`/api/meetings/${meetingId}/reprocess`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || data.message || "Failed to reprocess meeting");
      }

      // Refresh the page to show updated extraction data
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      setIsProcessing(false);
    }
  };

  return (
    <div className="mt-4 space-y-2">
      <Button
        onClick={handleReprocess}
        disabled={isProcessing}
        variant="secondary"
      >
        {isProcessing ? "Reprocessing..." : hasExtraction ? "Reprocess Extraction" : "Run Extraction"}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

