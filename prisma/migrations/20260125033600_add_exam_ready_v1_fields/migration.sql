-- CreateEnum
CREATE TYPE "FinalizeReason" AS ENUM ('COMPLETE_REVIEW', 'REQUIRED_CHANGES_ADDRESSED', 'EXCEPTION_APPROVED', 'OTHER');

-- CreateEnum
CREATE TYPE "FlagType" AS ENUM ('MISSING_DISCLOSURE', 'CONFLICT_LANGUAGE', 'MISSING_SUITABILITY_BASIS');

-- CreateEnum
CREATE TYPE "FlagSeverity" AS ENUM ('INFO', 'WARN', 'CRITICAL');

-- CreateEnum
CREATE TYPE "FlagStatus" AS ENUM ('OPEN', 'RESOLVED', 'DISMISSED', 'OVERRIDDEN');

-- CreateEnum
CREATE TYPE "FlagResolutionType" AS ENUM ('ADD_CONTEXT', 'DISMISSED_WITH_REASON', 'DISCLOSED_ELSEWHERE', 'FOLLOW_UP_REQUIRED', 'OVERRIDE_APPROVED');

-- CreateEnum
CREATE TYPE "FlagCreatedByType" AS ENUM ('SYSTEM', 'USER');

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "finalizeNote" TEXT,
ADD COLUMN     "finalizeReason" "FinalizeReason",
ADD COLUMN     "finalizedPolicyVersion" INTEGER,
ADD COLUMN     "samplingBucket" TEXT,
ADD COLUMN     "samplingRuleId" TEXT,
ADD COLUMN     "sourceFileMime" TEXT,
ADD COLUMN     "sourceFileName" TEXT,
ADD COLUMN     "sourceFileSha256" TEXT,
ADD COLUMN     "sourceFileSize" INTEGER,
ADD COLUMN     "sourceUploadedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Flag" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "type" "FlagType" NOT NULL,
    "severity" "FlagSeverity" NOT NULL DEFAULT 'WARN',
    "status" "FlagStatus" NOT NULL DEFAULT 'OPEN',
    "evidence" JSONB,
    "createdByType" "FlagCreatedByType" NOT NULL DEFAULT 'SYSTEM',
    "createdByUserId" TEXT,
    "resolvedByUserId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionType" "FlagResolutionType",
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Flag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Flag_workspaceId_idx" ON "Flag"("workspaceId");

-- CreateIndex
CREATE INDEX "Flag_workspaceId_meetingId_idx" ON "Flag"("workspaceId", "meetingId");

-- CreateIndex
CREATE INDEX "Flag_workspaceId_status_idx" ON "Flag"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "Flag_meetingId_type_idx" ON "Flag"("meetingId", "type");

-- AddForeignKey
ALTER TABLE "Flag" ADD CONSTRAINT "Flag_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Flag" ADD CONSTRAINT "Flag_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
