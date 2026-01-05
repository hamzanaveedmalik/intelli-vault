import { auth } from "~/server/auth";
import { db } from "~/server/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.workspaceId || !session.user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all meetings for the workspace
    const meetings = await db.meeting.findMany({
      where: {
        workspaceId: session.user.workspaceId,
      },
      select: {
        id: true,
        status: true,
        finalizedAt: true,
        draftReadyAt: true,
        timeToFinalize: true,
        createdAt: true,
      },
    });

    // Calculate metrics
    const totalMeetings = meetings.length;
    const finalizedMeetings = meetings.filter((m) => m.status === "FINALIZED");
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

    // Format time in minutes
    const formatTime = (seconds: number | null): string | null => {
      if (seconds === null) return null;
      const minutes = seconds / 60;
      return `${minutes.toFixed(1)} min`;
    };

    // Additional metrics for OWNER_CCO
    let userActivity: any = null;
    let auditLogSummary: any = null;

    if (session.user.role === "OWNER_CCO") {
      // User activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentAuditEvents = await db.auditEvent.findMany({
        where: {
          workspaceId: session.user.workspaceId,
          timestamp: {
            gte: thirtyDaysAgo,
          },
        },
        select: {
          userId: true,
          action: true,
        },
      });

      // Count actions by user
      const userActionCounts = new Map<string, Map<string, number>>();
      for (const event of recentAuditEvents) {
        if (!userActionCounts.has(event.userId)) {
          userActionCounts.set(event.userId, new Map());
        }
        const userActions = userActionCounts.get(event.userId)!;
        userActions.set(event.action, (userActions.get(event.action) || 0) + 1);
      }

      // Get user details
      const userIds = Array.from(userActionCounts.keys());
      const users = await db.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      userActivity = users.map((user) => ({
        userId: user.id,
        userName: user.name || user.email || "Unknown",
        actionCounts: Object.fromEntries(userActionCounts.get(user.id) || []),
        totalActions: Array.from(userActionCounts.get(user.id)?.values() || []).reduce((a, b) => a + b, 0),
      }));

      // Audit log summary (last 30 days)
      const actionCounts = new Map<string, number>();
      for (const event of recentAuditEvents) {
        actionCounts.set(event.action, (actionCounts.get(event.action) || 0) + 1);
      }

      auditLogSummary = {
        totalEvents: recentAuditEvents.length,
        actionCounts: Object.fromEntries(actionCounts),
      };
    }

    return Response.json({
      workspace: {
        totalMeetings,
        finalizedCount,
        finalizeRate: Math.round(finalizeRate * 10) / 10, // Round to 1 decimal
        timeToFinalize: {
          median: formatTime(medianTimeToFinalize),
          medianSeconds: medianTimeToFinalize,
          p90: formatTime(p90TimeToFinalize),
          p90Seconds: p90TimeToFinalize,
          sampleSize: timeToFinalizeValues.length,
        },
      },
      ...(session.user.role === "OWNER_CCO" && {
        userActivity,
        auditLogSummary,
      }),
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}

