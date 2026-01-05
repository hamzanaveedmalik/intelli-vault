# Debug: QStash Jobs Not Publishing

## Issue
You've added QStash credentials but:
- No messages appear in QStash dashboard
- Meetings stay at "Uploading" status
- Nothing is processing

## Step-by-Step Debugging

### 1. Verify Environment Variables

Check that QStash variables are actually loaded:

```bash
cd ria-compliance-tool
cat .env | grep QSTASH
```

You should see:
```
QSTASH_TOKEN=...
QSTASH_CURRENT_SIGNING_KEY=...
QSTASH_NEXT_SIGNING_KEY=...
```

### 2. Restart Dev Server

**Critical**: Environment variables are only loaded when the server starts.

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 3. Check NEXT_PUBLIC_APP_URL

QStash needs to know where to send webhooks. Check your `.env`:

```bash
cat .env | grep NEXT_PUBLIC_APP_URL
```

**Important**: Based on your screenshots, you're using `localhost:3001`, but the code defaults to `localhost:3000`.

**Fix**: Add to `.env`:
```bash
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

### 4. Check Server Logs

When you upload a meeting, check your terminal (where `npm run dev` is running). Look for:

**Success**:
```
✅ No errors - job should be published
```

**Failure**:
```
Error publishing QStash job: [error message]
```

Common errors:
- `QStash token is required` - Token not loaded
- `Invalid URL` - NEXT_PUBLIC_APP_URL wrong
- `Network error` - Can't reach QStash API

### 5. Test QStash Connection

Create a test file `test-qstash.js`:

```javascript
import { Client } from "@upstash/qstash";

const qstash = new Client({
  token: process.env.QSTASH_TOKEN,
});

async function test() {
  try {
    const result = await qstash.publishJSON({
      url: "http://localhost:3001/api/jobs/process-meeting",
      body: { test: true },
    });
    console.log("✅ QStash connection works!", result);
  } catch (error) {
    console.error("❌ QStash error:", error);
  }
}

test();
```

Run:
```bash
node test-qstash.js
```

### 6. Check QStash Dashboard

After uploading a meeting:
1. Go to QStash dashboard → **Logs** tab
2. Look for messages with your webhook URL
3. Check for any failed messages

### 7. Local Development Limitation

**Important**: QStash needs to reach your local server at `http://localhost:3001`. 

**Problem**: QStash (cloud service) cannot reach `localhost` on your machine.

**Solutions**:

**Option A: Use ngrok (Recommended for testing)**
```bash
# Install ngrok
brew install ngrok  # macOS
# or download from https://ngrok.com

# Start tunnel
ngrok http 3001

# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# Update .env:
NEXT_PUBLIC_APP_URL="https://abc123.ngrok.io"
```

**Option B: Test without QStash (Development)**
Manually trigger jobs for now. See "Manual Job Trigger" below.

**Option C: Deploy to Vercel (Production)**
Once deployed, QStash can reach your production URL.

### 8. Manual Job Trigger (For Testing)

Since QStash can't reach localhost, manually trigger jobs:

1. **Get meeting details**:
   ```bash
   npm run db:studio
   ```
   - Find your meeting (Kiran Rai)
   - Note: `id`, `workspaceId`, `fileUrl`

2. **Manually call job endpoint**:
   ```bash
   curl -X POST http://localhost:3001/api/jobs/process-meeting \
     -H "Content-Type: application/json" \
     -d '{
       "meetingId": "cmk0ggfzu0001m63paj0lpt9m",
       "workspaceId": "your-workspace-id",
       "fileUrl": "workspaces/your-workspace-id/meetings/cmk0ggfzu0001m63paj0lpt9m/recording.mp4"
     }'
   ```

### 9. Verify Transcription Provider

Make sure transcription is configured:

```bash
cat .env | grep -E "TRANSCRIPTION|DEEPGRAM|ASSEMBLYAI"
```

Required:
```bash
TRANSCRIPTION_PROVIDER="deepgram"
DEEPGRAM_API_KEY="your-api-key"
```

## Quick Checklist

- [ ] QStash env vars in `.env` file
- [ ] Dev server restarted after adding env vars
- [ ] `NEXT_PUBLIC_APP_URL` set correctly (localhost:3001)
- [ ] Check server logs for errors
- [ ] Transcription provider API key configured
- [ ] For local dev: Use ngrok OR manually trigger jobs

## Expected Behavior

**With QStash working**:
1. Upload meeting → Status: UPLOADING
2. QStash job published → Status: PROCESSING
3. QStash calls webhook → Transcription starts
4. Transcription completes → Status: DRAFT_READY

**Without QStash (local dev)**:
1. Upload meeting → Status: UPLOADING
2. Manually trigger job → Status: PROCESSING
3. Transcription starts → Status: DRAFT_READY

## Most Likely Issue

**QStash cannot reach `localhost:3001`** - This is expected for local development.

**Solutions**:
1. Use ngrok to expose localhost (best for testing QStash)
2. Manually trigger jobs (quickest for development)
3. Deploy to Vercel (for production testing)

