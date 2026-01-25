 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";

interface FlagItem {
  id: string;
  type: string;
  severity: string;
  status: string;
  evidence: any;
  createdAt: string;
}

type ResolutionAction = "RESOLVE" | "DISMISS" | "OVERRIDE";

const getSeverityVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (severity) {
    case "CRITICAL":
      return "destructive";
    case "WARN":
      return "default";
    default:
      return "secondary";
  }
};

const getResolutionOptions = (action: ResolutionAction) => {
  if (action === "DISMISS") {
    return [{ value: "DISMISSED_WITH_REASON", label: "Dismissed with reason" }];
  }
  if (action === "OVERRIDE") {
    return [{ value: "OVERRIDE_APPROVED", label: "Override approved" }];
  }
  return [
    { value: "ADD_CONTEXT", label: "Add context" },
    { value: "DISCLOSED_ELSEWHERE", label: "Disclosed elsewhere" },
    { value: "FOLLOW_UP_REQUIRED", label: "Follow-up required" },
  ];
};

export default function FlagsPanel({
  flags,
  userRole,
}: {
  flags: FlagItem[];
  userRole: string | null | undefined;
}) {
  const router = useRouter();
  const [activeFlagId, setActiveFlagId] = useState<string | null>(null);
  const [action, setAction] = useState<ResolutionAction | null>(null);
  const [resolutionType, setResolutionType] = useState<string>("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  if (!flags.length) {
    return null;
  }

  const openDialog = (flagId: string, nextAction: ResolutionAction) => {
    setActiveFlagId(flagId);
    setAction(nextAction);
    const options = getResolutionOptions(nextAction);
    setResolutionType(options[0]?.value ?? "");
    setResolutionNote("");
  };

  const closeDialog = () => {
    setActiveFlagId(null);
    setAction(null);
    setResolutionType("");
    setResolutionNote("");
  };

  const handleResolve = async () => {
    if (!activeFlagId || !action) {
      return;
    }
    if (!resolutionType) {
      return;
    }
    if ((action === "DISMISS" || action === "OVERRIDE") && !resolutionNote.trim()) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/flags/${activeFlagId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          resolutionType,
          resolutionNote: resolutionNote.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update flag");
      }

      router.refresh();
      closeDialog();
    } catch (error) {
      console.error("Failed to resolve flag:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const reviewEvidence = (flag: FlagItem) => {
    const startTime = flag.evidence?.recommendation?.startTime ?? flag.evidence?.startTime;
    if (typeof startTime === "number") {
      const segmentElement = document.querySelector(
        `[data-timestamp="${Math.floor(startTime)}"]`
      );
      if (segmentElement) {
        segmentElement.scrollIntoView({ behavior: "smooth", block: "center" });
        segmentElement.classList.add("bg-yellow-100");
        setTimeout(() => {
          segmentElement.classList.remove("bg-yellow-100");
        }, 2000);
      }
    }
  };

  const scrollToClaim = (flag: FlagItem) => {
    const claimKey = flag.evidence?.recommendation?.startTime;
    if (typeof claimKey !== "number") {
      return;
    }
    const claimElement = document.querySelector(
      `[data-claim-field="recommendations"][data-claim-start="${Math.floor(claimKey)}"]`
    );
    if (claimElement) {
      claimElement.scrollIntoView({ behavior: "smooth", block: "center" });
      claimElement.classList.add("ring-2", "ring-amber-400");
      setTimeout(() => {
        claimElement.classList.remove("ring-2", "ring-amber-400");
      }, 2000);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Requires Attention</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {flags.map((flag) => (
          <div
            key={flag.id}
            id={`flag-${flag.id}`}
            className="rounded-md border p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getSeverityVariant(flag.severity)}>{flag.severity}</Badge>
              <Badge variant="outline">{flag.type.replace(/_/g, " ")}</Badge>
              <Badge variant="secondary">{flag.status}</Badge>
            </div>
            {flag.evidence?.recommendation?.text ? (
              <div className="text-sm">
                <span className="font-medium">Recommendation:</span> {flag.evidence.recommendation.text}
              </div>
            ) : null}
            {flag.evidence?.recommendation?.snippet ? (
              <div className="text-xs text-muted-foreground">
                “{flag.evidence.recommendation.snippet}”
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => reviewEvidence(flag)}>
                Review evidence
              </Button>
              <Button size="sm" variant="outline" onClick={() => scrollToClaim(flag)}>
                View claim
              </Button>
              {flag.status === "OPEN" && (
                <>
                  <Button size="sm" onClick={() => openDialog(flag.id, "RESOLVE")}>
                    Resolve
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => openDialog(flag.id, "DISMISS")}>
                    Dismiss
                  </Button>
                  {userRole === "OWNER_CCO" && (
                    <Button size="sm" variant="destructive" onClick={() => openDialog(flag.id, "OVERRIDE")}>
                      Override
                    </Button>
                  )}
                </>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              Created {new Date(flag.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </CardContent>

      <Dialog open={!!activeFlagId} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Flag</DialogTitle>
            <DialogDescription>
              Select a resolution and record your rationale.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Resolution Type</Label>
              <Select value={resolutionType} onValueChange={setResolutionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a resolution" />
                </SelectTrigger>
                <SelectContent>
                  {action &&
                    getResolutionOptions(action).map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Resolution Note</Label>
              <Textarea
                value={resolutionNote}
                onChange={(event) => setResolutionNote(event.target.value)}
                placeholder="Add context for this decision"
              />
              {(action === "DISMISS" || action === "OVERRIDE") && (
                <p className="text-xs text-muted-foreground">Required for dismiss or override.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={
                isSaving ||
                !resolutionType ||
                ((action === "DISMISS" || action === "OVERRIDE") && !resolutionNote.trim())
              }
            >
              {isSaving ? "Saving..." : "Save Resolution"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
