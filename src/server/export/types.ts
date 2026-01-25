/**
 * Type definitions for export functions
 * These match the Prisma schema models
 */

export interface Version {
  id: string;
  meetingId: string;
  version: number;
  editorId: string;
  whatChanged: string;
  reason: string | null;
  timestamp: Date;
}

export interface Meeting {
  id: string;
  workspaceId: string;
  clientName: string;
  meetingType: string;
  meetingDate: Date;
  status: string;
  fileUrl: string | null;
  sourceFileSha256: string | null;
  sourceFileName: string | null;
  sourceFileSize: number | null;
  sourceFileMime: string | null;
  sourceUploadedAt: Date | null;
  transcript: unknown;
  extraction: unknown;
  finalizedBy: string | null;
  finalizedAt: Date | null;
  finalizeReason: string | null;
  finalizeNote: string | null;
  finalizedPolicyVersion: number | null;
  samplingBucket: string | null;
  samplingRuleId: string | null;
  draftReadyAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  retentionYears: number;
  legalHold: boolean;
  createdAt: Date;
  updatedAt: Date;
  billingStatus: string;
  pilotStartDate: Date | null;
  subscriptionStartDate: Date | null;
}

