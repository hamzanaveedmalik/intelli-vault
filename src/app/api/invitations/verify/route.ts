import { db } from "~/server/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return Response.json({ error: "Token is required" }, { status: 400 });
  }

  try {
    const invitation = await db.invitation.findUnique({
      where: { token },
      include: {
        workspace: true,
      },
    });

    if (!invitation) {
      return Response.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.acceptedAt) {
      return Response.json(
        { error: "This invitation has already been accepted" },
        { status: 400 }
      );
    }

    if (invitation.expiresAt < new Date()) {
      return Response.json(
        { error: "This invitation has expired" },
        { status: 400 }
      );
    }

    return Response.json({
      invitation: {
        workspaceName: invitation.workspace.name,
        role: invitation.role,
        email: invitation.email,
      },
    });
  } catch (error) {
    console.error("Error verifying invitation:", error);
    return Response.json(
      { error: "Failed to verify invitation" },
      { status: 500 }
    );
  }
}


