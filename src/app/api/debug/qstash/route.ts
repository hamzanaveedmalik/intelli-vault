import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Debug endpoint to check QStash configuration
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    qstash: {
      token: !!process.env.QSTASH_TOKEN ? "SET" : "NOT SET",
      currentSigningKey: !!process.env.QSTASH_CURRENT_SIGNING_KEY ? "SET" : "NOT SET",
      nextSigningKey: !!process.env.QSTASH_NEXT_SIGNING_KEY ? "SET" : "NOT SET",
    },
    webhook: {
      baseUrl: process.env.NEXT_PUBLIC_APP_URL || "NOT SET",
      webhookUrl: process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/process-meeting`
        : "NOT SET",
    },
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}

