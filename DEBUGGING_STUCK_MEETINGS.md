# Debugging Stuck Meetings

If your meetings are stuck in the "PROCESSING" stage, use this guide to diagnose and fix the issue.

## Quick Debug Steps

### 1. Use the Debug Panel

1. Navigate to the stuck meeting's detail page (e.g., `/meetings/[id]`)
2. Scroll down to the **"Debug Information"** panel
3. Click **"Refresh"** to load diagnostic information
4. Review the diagnosis, errors, and recommendations

### 2. Check Common Issues

#### Issue: QStash Job Not Published

**Symptoms:**
- Status: PROCESSING
- Upload complete: Yes
- Transcription complete: No
- Error: "Upload never completed - QStash job may not have been published"

**Solution:**
1. Check Vercel environment variables:
   - `QSTASH_TOKEN` - Must be set
   - `NEXT_PUBLIC_APP_URL` - Must be your Vercel URL (not localhost)

2. Check Vercel function logs for:
   - `✅ QStash job published successfully!` - Success
   - `❌ Error publishing QStash job:` - Failure

3. If QStash job wasn't published, click **"Retry Processing"** in the debug panel

#### Issue: Transcription Service Failing

**Symptoms:**
- Status: PROCESSING
- Upload complete: Yes
- Transcription complete: No
- Error: "Transcription failed"

**Solution:**
1. Check environment variables:
   - `TRANSCRIPTION_PROVIDER` - Must be `deepgram` or `assemblyai`
   - `DEEPGRAM_API_KEY` - Required if using Deepgram
   - `ASSEMBLYAI_API_KEY` - Required if using AssemblyAI

2. Check Vercel function logs for transcription errors

3. Verify API keys are valid in provider dashboard

#### Issue: Extraction Service Failing

**Symptoms:**
- Status: PROCESSING
- Transcription complete: Yes
- Extraction complete: No
- Error: "Extraction failed"

**Solution:**
1. Check environment variables:
   - `EXTRACTION_PROVIDER` - Must be `openai` or `anthropic`
   - `OPENAI_API_KEY` - Required if using OpenAI
   - `ANTHROPIC_API_KEY` - Required if using Anthropic

2. Check Vercel function logs for extraction errors

3. Verify API keys are valid and have sufficient credits

#### Issue: QStash Webhook Not Reaching Your App

**Symptoms:**
- QStash job published successfully
- But webhook handler never called
- Status stuck in PROCESSING

**Solution:**
1. Verify `NEXT_PUBLIC_APP_URL` is correct and publicly accessible
2. Check QStash dashboard for failed messages
3. Verify `/api/jobs/process-meeting` endpoint is accessible
4. Check Vercel deployment is live (not paused)

## Manual Debugging

### Check Meeting Status via API

```bash
# Get debug information
curl https://your-app.vercel.app/api/debug/meeting/[meeting-id] \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### Check Vercel Logs

1. Go to Vercel Dashboard → Your Project → Functions
2. Look for `/api/jobs/process-meeting` function logs
3. Check for errors related to:
   - QStash signature verification
   - Transcription service calls
   - Extraction service calls
   - Database updates

### Check QStash Dashboard

1. Go to [Upstash QStash Dashboard](https://console.upstash.com/qstash)
2. Click on **"Logs"** tab
3. Look for:
   - Published messages (should see your meeting IDs)
   - Failed messages (check error details)
   - Retry attempts

## Retry Processing

If a meeting is stuck, you can manually retry:

1. Go to the meeting detail page
2. Scroll to the Debug Panel
3. Click **"Retry Processing"**
4. This will republish the QStash job

Or use the API:

```bash
curl -X POST https://your-app.vercel.app/api/debug/meeting/[meeting-id]/retry \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

## Common Error Messages

### "QSTASH_TOKEN is not configured"
- **Fix:** Add `QSTASH_TOKEN` to Vercel environment variables

### "NEXT_PUBLIC_APP_URL is not set"
- **Fix:** Set `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL (e.g., `https://intelli-vault.vercel.app`)

### "QStash cannot reach localhost URLs"
- **Fix:** Change `NEXT_PUBLIC_APP_URL` from `localhost` to your Vercel URL

### "Transcription failed: [error message]"
- **Fix:** Check transcription service API key and credits

### "Extraction failed: [error message]"
- **Fix:** Check extraction service API key and credits

## File Size Considerations

Large files (6-7MB) may take longer to process:
- Transcription: ~1-2 minutes per 10 minutes of audio
- Extraction: ~30-60 seconds per transcript
- Total: ~2-3 minutes for a 30-minute meeting

If processing takes longer than 10 minutes, check:
1. Vercel function timeout limits (default: 10s for Hobby, 60s for Pro)
2. QStash job timeout settings
3. Transcription service rate limits

## Still Stuck?

1. Check all environment variables are set correctly
2. Review Vercel function logs for detailed errors
3. Check QStash dashboard for message status
4. Verify all API keys are valid and have credits
5. Try retrying the processing job
6. If all else fails, check the audit events in the database for detailed error information

