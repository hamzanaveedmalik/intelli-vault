import { Client } from "@upstash/qstash";
import { env } from "~/env";

// Initialize QStash client
export const qstash = new Client({
  token: env.QSTASH_TOKEN || "",
});

/**
 * Publish a job to process a meeting
 */
export async function publishProcessMeetingJob({
  meetingId,
  workspaceId,
  fileUrl,
}: {
  meetingId: string;
  workspaceId: string;
  fileUrl: string;
}) {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${baseUrl}/api/jobs/process-meeting`;

  const payload = {
    meetingId,
    workspaceId,
    fileUrl,
  };

  // Publish job to QStash
  try {
    const messageId = await qstash.publishJSON({
      url: webhookUrl,
      body: payload,
      // Retry configuration
      retries: 3,
      // Delay before first retry (exponential backoff)
      delay: 5,
    });

    console.log(`✅ QStash job published: ${messageId} for meeting ${meetingId}`);
    return messageId;
  } catch (error) {
    console.error("❌ QStash publish error:", error);
    throw error;
  }
}


