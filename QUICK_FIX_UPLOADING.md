# Quick Fix: Meeting Stuck at "Uploading"

## Problem

Your meeting status is stuck at "Uploading" and not progressing to "Processing" or "Draft Ready".

## Most Likely Cause

**QStash is not configured** - The background job system isn't publishing jobs, so transcription never starts.

## Quick Solution

### Option 1: Configure QStash (Recommended for Production)

1. **Get QStash Token**:
   - Go to https://console.upstash.com
   - Sign up/login
   - Go to **QStash** → **Dashboard**
   - Copy your **Token**

2. **Add to `.env`**:
   ```bash
   QSTASH_TOKEN="your-qstash-token-here"
   ```

3. **Restart dev server**:
   ```bash
   npm run dev
   ```

4. **Upload a new meeting** - It should now progress to PROCESSING → DRAFT_READY

### Option 2: Test Without QStash (Development Only)

If you want to test transcription without QStash, you can manually trigger the job:

1. **Get your meeting ID** from the URL**:
   - Example: `localhost:3001/meetings/cmk0erq0v0001m6u7fpgb0ijs`
   - Meeting ID: `cmk0erq0v0001m6u7fpgb0ijs`

2. **Get your workspace ID** (from database or session)

3. **Get the file key** (from database - `Meeting.fileUrl` field)

4. **Call the job endpoint directly**:
   ```bash
   curl -X POST http://localhost:3001/api/jobs/process-meeting \
     -H "Content-Type: application/json" \
     -d '{
       "meetingId": "cmk0erq0v0001m6u7fpgb0ijs",
       "workspaceId": "your-workspace-id",
       "fileUrl": "workspaces/your-workspace-id/meetings/cmk0erq0v0001m6u7fpgb0ijs/recording.mp4"
     }'
   ```

   **Note**: Replace the values with your actual meeting ID, workspace ID, and file key.

### Option 3: Check Server Logs

Check your terminal where `npm run dev` is running. Look for:

- ✅ "Error publishing QStash job" - QStash not configured
- ✅ "QStash token is required" - Missing QSTASH_TOKEN
- ✅ Any other errors during upload

### Option 4: Check Database Status

1. **Open Prisma Studio**:
   ```bash
   npm run db:studio
   ```

2. **Navigate to Meeting table**

3. **Find your meeting** (search by client name "John Smith")

4. **Check**:
   - `status` field - Should be PROCESSING or DRAFT_READY
   - `fileUrl` field - Should contain S3 key
   - `transcript` field - Should contain segments if transcription completed

## Expected Flow

1. **Upload** → Status: `UPLOADING`
2. **QStash job published** → Status: `PROCESSING` (if QStash configured)
3. **Transcription completes** → Status: `DRAFT_READY`
4. **Transcript appears** in meeting detail page

## If QStash is Not Configured

**Current behavior**: 
- Upload succeeds ✅
- File stored in S3/R2 ✅
- QStash job fails silently ❌
- Status stays UPLOADING ❌

**Why**: The code catches QStash errors to prevent upload failures, but the meeting stays in UPLOADING status.

## Next Steps

1. **Add QSTASH_TOKEN to `.env`** (recommended)
2. **Or manually trigger job** (for testing)
3. **Or check server logs** for specific errors

Once QStash is configured, new uploads will automatically progress through the pipeline.

