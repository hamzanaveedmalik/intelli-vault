import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { z } from "zod";

const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name } = createWorkspaceSchema.parse(body);

    // Create workspace and assign user as OWNER_CCO
    const workspace = await db.workspace.create({
      data: {
        name,
        retentionYears: 6, // Default per SEC requirement + buffer
        legalHold: false,
        users: {
          create: {
            userId: session.user.id,
            role: "OWNER_CCO",
          },
        },
      },
    });

    // Log workspace creation in audit event
    // Note: Using UPLOAD action as placeholder; workspace creation action can be added to enum in Phase 2
    await db.auditEvent.create({
      data: {
        workspaceId: workspace.id,
        userId: session.user.id,
        action: "UPLOAD", // Placeholder - workspace creation action can be added to AuditAction enum later
        resourceType: "workspace",
        resourceId: workspace.id,
        metadata: {
          workspaceName: name,
          action: "workspace_created",
        },
      },
    });

    return Response.json(
      {
        workspace: {
          id: workspace.id,
          name: workspace.name,
          retentionYears: workspace.retentionYears,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating workspace:", error);
    return Response.json(
      { error: "Failed to create workspace" },
      { status: 500 }
    );
  }
}

