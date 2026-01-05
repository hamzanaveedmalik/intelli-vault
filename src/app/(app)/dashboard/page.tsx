import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.workspaceId) {
    redirect("/workspaces/new");
  }

  // Fetch meetings for the workspace
  const meetings = await db.meeting.findMany({
    where: {
      workspaceId: session.user.workspaceId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50, // Limit to 50 most recent
  });

  // Calculate metrics
  const totalMeetings = await db.meeting.count({
    where: {
      workspaceId: session.user.workspaceId,
    },
  });

  const finalizedMeetings = await db.meeting.findMany({
    where: {
      workspaceId: session.user.workspaceId,
      status: "FINALIZED",
    },
    select: {
      timeToFinalize: true,
    },
  });

  const finalizedCount = finalizedMeetings.length;
  const finalizeRate = totalMeetings > 0 ? (finalizedCount / totalMeetings) * 100 : 0;

  // Calculate Time-to-Finalize metrics
  const timeToFinalizeValues = finalizedMeetings
    .map((m) => m.timeToFinalize)
    .filter((v): v is number => v !== null && v !== undefined)
    .sort((a, b) => a - b);

  let medianTimeToFinalize: number | null = null;
  let p90TimeToFinalize: number | null = null;

  if (timeToFinalizeValues.length > 0) {
    // Calculate median
    const mid = Math.floor(timeToFinalizeValues.length / 2);
    medianTimeToFinalize =
      timeToFinalizeValues.length % 2 === 0
        ? (timeToFinalizeValues[mid - 1]! + timeToFinalizeValues[mid]!) / 2
        : timeToFinalizeValues[mid]!;

    // Calculate P90 (90th percentile)
    const p90Index = Math.ceil(timeToFinalizeValues.length * 0.9) - 1;
    p90TimeToFinalize = timeToFinalizeValues[p90Index] ?? null;
  }

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return "N/A";
    const minutes = seconds / 60;
    return `${minutes.toFixed(1)} min`;
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "UPLOADING":
        return "secondary";
      case "PROCESSING":
        return "default";
      case "DRAFT_READY":
        return "default";
      case "DRAFT":
        return "outline";
      case "FINALIZED":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "UPLOADING":
        return "Uploading";
      case "PROCESSING":
        return "Processing";
      case "DRAFT_READY":
        return "Draft Ready";
      case "DRAFT":
        return "Draft";
      case "FINALIZED":
        return "Finalized";
      default:
        return status;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            View and manage your meeting recordings
          </p>
        </div>
        <Button asChild>
          <Link href="/upload">Upload Meeting</Link>
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMeetings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Finalized
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finalizedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(finalizeRate * 10) / 10}% finalize rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Time-to-Finalize (Median)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(medianTimeToFinalize)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {timeToFinalizeValues.length > 0
                ? `Target: ≤ 10 min (${medianTimeToFinalize! <= 600 ? "✓" : "✗"})`
                : "No finalized meetings yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Time-to-Finalize (P90)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(p90TimeToFinalize)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {timeToFinalizeValues.length > 0
                ? `Target: ≤ 15 min (${p90TimeToFinalize! <= 900 ? "✓" : "✗"})`
                : "No finalized meetings yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {meetings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-lg text-muted-foreground">No meetings yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload your first meeting recording to get started
            </p>
            <Button asChild className="mt-4">
              <Link href="/upload">Upload Meeting</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Meetings</CardTitle>
            <CardDescription>
              A list of all your meeting recordings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Name</TableHead>
                  <TableHead>Meeting Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meetings.map((meeting) => (
                  <TableRow key={meeting.id}>
                    <TableCell className="font-medium">
                      {meeting.clientName}
                    </TableCell>
                    <TableCell>{meeting.meetingType}</TableCell>
                    <TableCell>
                      {new Date(meeting.meetingDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(meeting.status)}>
                        {getStatusLabel(meeting.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(meeting.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="link" asChild>
                        <Link href={`/meetings/${meeting.id}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


