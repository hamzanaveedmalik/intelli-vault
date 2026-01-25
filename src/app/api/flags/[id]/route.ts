import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const resolveFlagSchema = z.object({
  action: z.enum(["RESOLVE", "DISMISS", "OVERRIDE"]),
  resolutionType: z.enum([
    "ADD_CONTEXT",
    "DISMISSED_WITH_REASON",
    "DISCLOSED_ELSEWHERE",
    "FOLLOW_UP_REQUIRED",
    "OVERRIDE_APPROVED",
  ]),
  resolutionNote: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.workspaceId || !session.user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, resolutionType, resolutionNote } = resolveFlagSchema.parse(body);

    const flag = await db.flag.findFirst({
      where: {
        id,
        workspaceId: session.user.workspaceId,
      },
    });

    if (!flag) {
      return Response.json({ error: "Flag not found" }, { status: 404 });
    }

    if (action === "OVERRIDE" && session.user.role !== "OWNER_CCO") {
      return Response.json({ error: "Only CCO can override flags" }, { status: 403 });
    }

    if ((action === "DISMISS" || action === "OVERRIDE") && !resolutionNote?.trim()) {
      return Response.json(
        { error: "Resolution note is required for this action" },
        { status: 400 }
      );
    }

    const nextStatus =
      action === "RESOLVE"
        ? "RESOLVED"
        : action === "DISMISS"
        ? "DISMISSED"
        : "OVERRIDDEN";

    const updatedFlag = await db.flag.update({
      where: { id: flag.id },
      data: {
        status: nextStatus,
        resolutionType,
        resolutionNote: resolutionNote?.trim() || null,
        resolvedByUserId: session.user.id,
        resolvedAt: new Date(),
      },
    });

    await db.auditEvent.create({
      data: {
        workspaceId: session.user.workspaceId,
        userId: session.user.id,
        action: "EDIT",
        resourceType: "meeting",
        resourceId: flag.meetingId,
        meetingId: flag.meetingId,
        metadata: {
          action: "flag_resolution",
          flagId: flag.id,
          status: nextStatus,
          resolutionType,
          resolutionNote: resolutionNote?.trim() || null,
        },
      },
    });

    return Response.json({ success: true, flag: updatedFlag });
  } catch (error) {
    console.error("Error resolving flag:", error);
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid request body", details: error.errors },
        { status: 400 }
      );
    }
    return Response.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}
