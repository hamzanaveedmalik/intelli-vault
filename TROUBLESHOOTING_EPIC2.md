# Troubleshooting EPIC 2: Transcription Pipeline

## Issue: Meeting Status Stuck at "Uploading"

If your meeting status is stuck at "Uploading" and not progressing to "Processing" or "Draft Ready", check the following:

### 1. Check QStash Configuration

**Problem**: QStash job may not be publishing.

**Check**:
- Is `QSTASH_TOKEN` set in your `.env` file?
- Check server logs for QStash publishing errors

**Solution**:
```bash
# Add to .env (optional for testing, but required for background jobs)
QSTASH_TOKEN="your-qstash-token"
```

**Note**: If QStash is not configured, the job won't be published, and the meeting will stay in UPLOADING status.

### 2. Check Transcription Provider Configuration

**Problem**: Transcription provider API key not set.

**Check**:
- Is `TRANSCRIPTION_PROVIDER` set in `.env`?
- Is the corresponding API key set (`DEEPGRAM_API_KEY` or `ASSEMBLYAI_API_KEY`)?

**Solution**:
```bash
# Add to .env
TRANSCRIPTION_PROVIDER="deepgram"  # or "assemblyai"
DEEPGRAM_API_KEY="your-api-key"  # Required if using Deepgram
```

### 3. Check Server Logs

**Check server console for errors**:
```bash
npm run dev
```

Look for:
- "Error publishing QStash job" - QStash configuration issue
- "Transcription failed" - Transcription provider issue
- "Deepgram API key is required" - Missing API key

### 4. Manual Status Check

**Check database directly**:
```bash
npm run db:studio
```

Navigate to `Meeting` table and check:
- `status` field - Should be PROCESSING or DRAFT_READY
- `transcript` field - Should contain segments if transcription completed
- `fileUrl` field - Should contain S3 key

### 5. Test QStash Job Manually

If QStash is configured, you can manually trigger the job:

```bash
# Get your meeting ID from the URL
# Then call the job endpoint directly (for testing only)
curl -X POST http://localhost:3000/api/jobs/process-meeting \
  -H "Content-Type: application/json" \
  -d '{
    "meetingId": "your-meeting-id",
    "workspaceId": "your-workspace-id",
    "fileUrl": "workspaces/your-workspace-id/meetings/your-meeting-id/recording.mp4"
  }'
```

**Note**: This bypasses QStash signature verification in dev mode.

### 6. Expected Flow

**Normal flow**:
1. Upload → Status: `UPLOADING`
2. QStash job published → Status: `PROCESSING`
3. Transcription completes → Status: `DRAFT_READY`
4. Transcript appears in viewer

**If stuck at UPLOADING**:
- QStash job not published (check QSTASH_TOKEN)
- Job publishing failed (check server logs)

**If stuck at PROCESSING**:
- Transcription in progress (wait a few minutes)
- Transcription failed (check server logs, check API key)

### 7. Quick Fix: Skip QStash for Testing

If you want to test transcription without QStash, you can temporarily modify the upload route to call transcription directly:

**⚠️ Warning**: This is for testing only. Don't use in production.

```typescript
// In src/app/api/upload/route.ts
// After file upload, instead of publishing QStash job:
import { transcribeAudio } from "~/server/transcription";
import { getSignedFileUrl } from "~/server/storage";

// Get signed URL
const audioUrl = await getSignedFileUrl(key, 3600);

// Transcribe directly (synchronous - blocks request)
const result = await transcribeAudio(audioUrl);

// Update meeting
await db.meeting.update({
  where: { id: meeting.id },
  data: {
    transcript: result.transcript,
    status: "DRAFT_READY",
    draftReadyAt: new Date(),
  },
});
```

### 8. Common Issues

**Issue**: "Deepgram API key is required"
- **Solution**: Add `DEEPGRAM_API_KEY` to `.env`

**Issue**: "Transcription failed: 401 Unauthorized"
- **Solution**: Check API key is correct and has sufficient credits

**Issue**: "QStash job not processing"
- **Solution**: 
  - Check `QSTASH_TOKEN` is set
  - Check QStash dashboard for job status
  - Verify webhook URL is accessible (for production)

**Issue**: "Meeting status not updating"
- **Solution**: 
  - Check database directly (Prisma Studio)
  - Verify job handler is being called
  - Check server logs for errors

### 9. Debug Checklist

- [ ] QStash token configured in `.env`
- [ ] Transcription provider API key configured
- [ ] Server logs show no errors
- [ ] Database shows correct status
- [ ] File uploaded successfully to S3/R2
- [ ] QStash job appears in dashboard (if configured)

### 10. Next Steps

Once transcription is working:
1. Meeting status should change to `DRAFT_READY`
2. Transcript should appear in meeting detail page
3. Email notification should be sent (if Resend configured)

If issues persist, check:
- Server console logs
- Database state (Prisma Studio)
- QStash dashboard (if configured)
- Transcription provider dashboard (check usage/credits)

