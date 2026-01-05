# Fix: Meetings Stuck at "Uploading" Status

## Problem

Your meetings are stuck at "Uploading" status and not progressing to "Processing" or "Draft Ready".

## Root Cause

**QStash background jobs are not running** because:
1. `QSTASH_TOKEN` is not configured in `.env`, OR
2. QStash job publishing is failing silently

## Solution

### Step 1: Check Current Configuration

Check if `QSTASH_TOKEN` is in your `.env` file:

```bash
cd ria-compliance-tool
cat .env | grep QSTASH
```

If you see nothing or an empty value, QStash is not configured.

### Step 2: Configure QStash (Recommended)

**Option A: Set up QStash (for production-like testing)**

1. Go to https://console.upstash.com
2. Sign up/login (free tier available)
3. Navigate to **QStash** → **Dashboard**
4. Copy your **Token**

5. Add to `.env`:
   ```bash
   QSTASH_TOKEN="your-qstash-token-here"
   ```

6. Restart dev server:
   ```bash
   npm run dev
   ```

**Option B: Test without QStash (Development Only)**

For local testing, you can manually trigger jobs. See Step 3 below.

### Step 3: Fix Existing Meetings

Your existing meetings (Hamza Malik, John Smith) are stuck. You have two options:

#### Option A: Manually Trigger Jobs (Quick Fix)

1. **Get meeting details from database**:
   ```bash
   npm run db:studio
   ```
   - Open Meeting table
   - Find your meetings
   - Note: `id`, `workspaceId`, `fileUrl` (this is the S3 key)

2. **Manually call the job endpoint**:
   ```bash
   curl -X POST http://localhost:3001/api/jobs/process-meeting \
     -H "Content-Type: application/json" \
     -d '{
       "meetingId": "your-meeting-id",
       "workspaceId": "your-workspace-id",
       "fileUrl": "workspaces/your-workspace-id/meetings/your-meeting-id/recording.mp4"
     }'
   ```

   Replace:
   - `your-meeting-id` - From database (e.g., `cmk0erq0v0001m6u7fpgb0ijs`)
   - `your-workspace-id` - From database
   - `recording.mp4` - Check actual file extension in `fileUrl`

#### Option B: Upload New Meetings (After Configuring QStash)

Once QStash is configured, new uploads will automatically progress.

### Step 4: Verify Transcription Provider

Make sure transcription is configured:

```bash
# Check .env for transcription provider
cat .env | grep TRANSCRIPTION
```

Required:
```bash
TRANSCRIPTION_PROVIDER="deepgram"  # or "assemblyai"
DEEPGRAM_API_KEY="your-api-key"  # If using Deepgram
```

### Step 5: Check Server Logs

Look at your terminal where `npm run dev` is running. You should see:

**If QStash is not configured:**
```
Error publishing QStash job: [error message]
```

**If transcription is working:**
```
Transcribing meeting cmk0erq0v0001m6u7fpgb0ijs...
Transcription complete for meeting cmk0erq0v0001m6u7fpgb0ijs
```

## Expected Flow After Fix

1. **Upload** → Status: `UPLOADING`
2. **QStash job published** → Status: `PROCESSING` ✅
3. **Transcription completes** → Status: `DRAFT_READY` ✅
4. **Transcript appears** in meeting detail page ✅

## Quick Test Script

Create a file `test-job.sh`:

```bash
#!/bin/bash

# Replace these with your actual values
MEETING_ID="cmk0erq0v0001m6u7fpgb0ijs"
WORKSPACE_ID="your-workspace-id"
FILE_KEY="workspaces/${WORKSPACE_ID}/meetings/${MEETING_ID}/recording.mp4"

curl -X POST http://localhost:3001/api/jobs/process-meeting \
  -H "Content-Type: application/json" \
  -d "{
    \"meetingId\": \"${MEETING_ID}\",
    \"workspaceId\": \"${WORKSPACE_ID}\",
    \"fileUrl\": \"${FILE_KEY}\"
  }"
```

Run:
```bash
chmod +x test-job.sh
./test-job.sh
```

## Summary

**Immediate Fix:**
1. Add `QSTASH_TOKEN` to `.env` (or manually trigger jobs)
2. Restart dev server
3. Upload new meeting OR manually trigger existing meetings

**For Existing Meetings:**
- Use Prisma Studio to get meeting details
- Manually call `/api/jobs/process-meeting` endpoint
- Or wait for QStash configuration and upload new meetings

Once configured, the pipeline will work automatically! 🚀

