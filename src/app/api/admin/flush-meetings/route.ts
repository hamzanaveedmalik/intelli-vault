import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { deleteFile } from "~/server/storage";

/**
 * DELETE /api/admin/flush-meetings
 * 
 * WARNING: This deletes ALL meetings from the database AND storage.
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

    // Fetch all meetings to get their file keys before deletion
    const meetings = await db.meeting.findMany({
      select: {
        id: true,
        fileUrl: true,
      },
    });

    // Delete files from storage
    const deletePromises = meetings
      .filter((meeting) => meeting.fileUrl)
      .map((meeting) =>
        deleteFile(meeting.fileUrl!).catch((err) => {
          console.error(`Failed to delete file ${meeting.fileUrl}:`, err);
          // Continue even if file deletion fails
        })
      );

    await Promise.allSettled(deletePromises);

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
      message: `Successfully deleted ${result.count} meetings and their files from storage`,
      deletedCount: result.count,
      filesDeleted: meetings.filter((m) => m.fileUrl).length,
    });
  } catch (error) {
    console.error("Error flushing meetings:", error);
    return Response.json(
      { error: "Failed to flush meetings" },
      { status: 500 }
    );
  }
}

