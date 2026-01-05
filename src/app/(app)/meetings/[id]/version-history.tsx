"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

interface Version {
  id: string;
  version: number;
  editor: {
    id: string;
    name: string;
    email: string | null;
  };
  whatChanged: string;
  reason: string | null;
  timestamp: Date;
}

interface VersionHistoryProps {
  meetingId: string;
}

export default function VersionHistory({ meetingId }: VersionHistoryProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch(`/api/meetings/${meetingId}/versions`);
        if (!response.ok) {
          throw new Error("Failed to fetch version history");
        }
        const data = await response.json();
        setVersions(data.versions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVersions();
  }, [meetingId]);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading version history...</div>;
  }

  if (error) {
    return <div className="text-sm text-destructive">Error: {error}</div>;
  }

  if (versions.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No version history available. This meeting has not been edited yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {versions.map((version) => (
        <Card key={version.id}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Version {version.version}</Badge>
                  <span className="text-sm text-muted-foreground">
                    by {version.editor.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    • {new Date(version.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm font-medium mb-1">{version.whatChanged}</p>
                {version.reason && (
                  <p className="text-sm text-muted-foreground italic">
                    Reason: {version.reason}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

