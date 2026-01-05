import { auth } from "~/server/auth";
import { db } from "~/server/db";

/**
 * DELETE /api/admin/flush-meetings
 * 
 * WARNING: This deletes ALL meetings from the database.
 * Use with caution - this is a destructive operation.
 * 
 * Only accessible to authenticated users (for safety, you may want to add admin check)
 */
export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete all meetings (cascade will handle related records)
    const result = await db.meeting.deleteMany({});

    // Also delete related audit events for meetings
    await db.auditEvent.deleteMany({
      where: {
        resourceType: "meeting",
      },
    });

    // Delete versions
    await db.version.deleteMany({});

    return Response.json({
      message: `Successfully deleted ${result.count} meetings`,
      deletedCount: result.count,
    });
  } catch (error) {
    console.error("Error flushing meetings:", error);
    return Response.json(
      { error: "Failed to flush meetings" },
      { status: 500 }
    );
  }
}

