"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Loader2, RefreshCw, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

interface DebugData {
  meeting: {
    id: string;
    status: string;
    clientName: string;
    meetingDate: string;
    fileUrl: string | null;
    createdAt: string;
    updatedAt: string;
    draftReadyAt: string | null;
  };
  diagnosis: {
    status: string;
    hasFile: boolean;
    hasTranscript: boolean;
    hasExtraction: boolean;
    uploadComplete: boolean;
    transcriptionComplete: boolean;
    extractionComplete: boolean;
    hasErrors: boolean;
    errors: Array<{
      timestamp: string;
      action: string;
      error: string;
    }>;
    stuckReason: string | null;
  };
  auditEvents: Array<{
    id: string;
    action: string;
    timestamp: string;
    metadata: any;
  }>;
  environment: {
    QSTASH_TOKEN: boolean;
    NEXT_PUBLIC_APP_URL: string;
    TRANSCRIPTION_PROVIDER: string;
    EXTRACTION_PROVIDER: string;
    DEEPGRAM_API_KEY: boolean;
    ASSEMBLYAI_API_KEY: boolean;
    OPENAI_API_KEY: boolean;
    ANTHROPIC_API_KEY: boolean;
  };
  recommendations: string[];
}

interface DebugProps {
  meetingId: string;
}

export function DebugPanel({ meetingId }: DebugProps) {
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrySuccess, setRetrySuccess] = useState(false);

  const fetchDebugInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/debug/meeting/${meetingId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch debug info");
      }
      const data = await response.json();
      setDebugData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch debug info");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    setRetrySuccess(false);
    setError(null);
    try {
      const response = await fetch(`/api/debug/meeting/${meetingId}/retry`, {
        method: "POST",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to retry processing");
      }
      setRetrySuccess(true);
      // Refresh debug info after a delay
      setTimeout(() => {
        fetchDebugInfo();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retry processing");
    } finally {
      setRetrying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "FINALIZED":
        return <Badge variant="default">Finalized</Badge>;
      case "DRAFT_READY":
        return <Badge variant="secondary">Draft Ready</Badge>;
      case "DRAFT":
        return <Badge variant="secondary">Draft</Badge>;
      case "PROCESSING":
        return <Badge variant="outline">Processing</Badge>;
      case "UPLOADING":
        return <Badge variant="outline">Uploading</Badge>;
      case "ERROR":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>Diagnose processing issues</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDebugInfo}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
            {debugData?.diagnosis.status === "PROCESSING" && (
              <Button
                variant="default"
                size="sm"
                onClick={handleRetry}
                disabled={retrying}
              >
                {retrying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry Processing
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {retrySuccess && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Processing job republished successfully! Check status in a few moments.
            </AlertDescription>
          </Alert>
        )}

        {!debugData && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Click "Refresh" to load debug information</p>
          </div>
        )}

        {debugData && (
          <div className="space-y-6">
            {/* Meeting Status */}
            <div>
              <h3 className="font-semibold mb-2">Meeting Status</h3>
              <div className="flex items-center gap-2">
                {getStatusBadge(debugData.diagnosis.status)}
                <span className="text-sm text-muted-foreground">
                  {debugData.meeting.clientName} - {new Date(debugData.meeting.meetingDate).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Diagnosis */}
            <div>
              <h3 className="font-semibold mb-2">Diagnosis</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {debugData.diagnosis.hasFile ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>File uploaded: {debugData.diagnosis.hasFile ? "Yes" : "No"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {debugData.diagnosis.uploadComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>Upload complete: {debugData.diagnosis.uploadComplete ? "Yes" : "No"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {debugData.diagnosis.transcriptionComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>Transcription complete: {debugData.diagnosis.transcriptionComplete ? "Yes" : "No"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {debugData.diagnosis.extractionComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>Extraction complete: {debugData.diagnosis.extractionComplete ? "Yes" : "No"}</span>
                </div>
                {debugData.diagnosis.stuckReason && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{debugData.diagnosis.stuckReason}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>

            {/* Errors */}
            {debugData.diagnosis.hasErrors && (
              <div>
                <h3 className="font-semibold mb-2 text-red-600">Errors</h3>
                <div className="space-y-2">
                  {debugData.diagnosis.errors.map((err, idx) => (
                    <Alert key={idx} variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="font-medium">{err.action}</div>
                        <div className="text-xs mt-1">{err.error}</div>
                        <div className="text-xs mt-1 text-muted-foreground">
                          {new Date(err.timestamp).toLocaleString()}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Environment Check */}
            <div>
              <h3 className="font-semibold mb-2">Environment Variables</h3>
              <div className="space-y-1 text-sm font-mono">
                <div className="flex items-center gap-2">
                  {debugData.environment.QSTASH_TOKEN ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>QSTASH_TOKEN: {debugData.environment.QSTASH_TOKEN ? "Set" : "NOT SET"}</span>
                </div>
                <div className="flex items-center gap-2">
                  {debugData.environment.NEXT_PUBLIC_APP_URL !== "NOT SET" && !debugData.environment.NEXT_PUBLIC_APP_URL.includes("localhost") ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>NEXT_PUBLIC_APP_URL: {debugData.environment.NEXT_PUBLIC_APP_URL}</span>
                </div>
                <div className="flex items-center gap-2">
                  {debugData.environment.TRANSCRIPTION_PROVIDER !== "NOT SET" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>TRANSCRIPTION_PROVIDER: {debugData.environment.TRANSCRIPTION_PROVIDER}</span>
                </div>
                <div className="flex items-center gap-2">
                  {debugData.environment.EXTRACTION_PROVIDER !== "NOT SET" ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>EXTRACTION_PROVIDER: {debugData.environment.EXTRACTION_PROVIDER}</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {debugData.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Recommendations</h3>
                <div className="space-y-1">
                  {debugData.recommendations.map((rec, idx) => (
                    <Alert key={idx} variant={rec.startsWith("❌") ? "destructive" : rec.startsWith("⚠️") ? "default" : "default"}>
                      <AlertDescription>{rec}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Audit Events */}
            <div>
              <h3 className="font-semibold mb-2">Recent Events</h3>
              <div className="space-y-1 text-sm">
                {debugData.auditEvents.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center gap-2 p-2 border rounded">
                    <Badge variant="outline">{event.action}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                    {event.metadata && typeof event.metadata === "object" && "action" in event.metadata && (
                      <span className="text-xs text-muted-foreground">
                        ({event.metadata.action as string})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

