import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const updateSettingsSchema = z.object({
  retentionYears: z.number().min(5, "Retention must be at least 5 years").max(10),
  legalHold: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { workspaceId } = params;

    // Only OWNER_CCO can update settings
    if (session.user.role !== "OWNER_CCO") {
      return new Response("Forbidden: Only workspace owners can update settings", {
        status: 403,
      });
    }

    // Verify workspace exists and user belongs to it
    const workspace = await db.workspace.findFirst({
      where: {
        id: workspaceId,
        users: {
          some: {
            userId: session.user.id,
            role: "OWNER_CCO",
          },
        },
      },
    });

    if (!workspace) {
      return new Response("Workspace not found or access denied", {
        status: 404,
      });
    }

    const body = await request.json();
    const { retentionYears, legalHold } = updateSettingsSchema.parse(body);

    // Update workspace settings
    const updated = await db.workspace.update({
      where: { id: workspaceId },
      data: {
        retentionYears,
        legalHold,
      },
    });

    // Log settings change
    await db.auditEvent.create({
      data: {
        workspaceId,
        userId: session.user.id,
        action: "UPLOAD", // Placeholder - settings action can be added later
        resourceType: "workspace",
        resourceId: workspaceId,
        metadata: {
          action: "settings_updated",
          retentionYears,
          legalHold,
        },
      },
    });

    return Response.json({
      workspace: {
        id: updated.id,
        retentionYears: updated.retentionYears,
        legalHold: updated.legalHold,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error updating workspace settings:", error);
    return Response.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}


