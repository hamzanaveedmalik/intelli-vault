# QStash Setup Guide

## Quick Setup

From your QStash dashboard, copy these values to your `.env` file:

```bash
# QStash Configuration
QSTASH_TOKEN="eyJVc2VySUQi0iJkNDI0M2NmNC0xZGViLTQ0ZTMt0GJjZi0wZmZjNjg4ZGE40DMiLCJQYXNzd29yZCI6IjY3NmU2N2EyNmQ0MjQ0MTJiZGNmNzU0NjdhNjI1ZWY5In0="
QSTASH_CURRENT_SIGNING_KEY="sig_4gGnxii7yAV5mtQHpWw57bgPED7m"
QSTASH_NEXT_SIGNING_KEY="sig_6jtzbCdMGwBcmiSJXsHKoKQuRJVz"
```

**Note**: Replace with your actual values from the QStash dashboard.

## What Each Variable Does

- **QSTASH_TOKEN**: Used to publish jobs to QStash
- **QSTASH_CURRENT_SIGNING_KEY**: Used to verify webhook signatures (security)
- **QSTASH_NEXT_SIGNING_KEY**: Used for key rotation (optional but recommended)

## After Adding to .env

1. **Restart your dev server**:
   ```bash
   npm run dev
   ```

2. **Upload a new meeting** - It should now automatically process!

3. **For existing stuck meetings**, you can manually trigger them (see below)

## Manual Job Trigger (For Existing Meetings)

If you have meetings stuck at "Uploading", you can manually trigger the job:

1. **Get meeting details from database**:
   ```bash
   npm run db:studio
   ```
   - Open `Meeting` table
   - Find your meeting
   - Note: `id`, `workspaceId`, `fileUrl`

2. **Call the job endpoint**:
   ```bash
   curl -X POST http://localhost:3001/api/jobs/process-meeting \
     -H "Content-Type: application/json" \
     -d '{
       "meetingId": "your-meeting-id",
       "workspaceId": "your-workspace-id",
       "fileUrl": "workspaces/your-workspace-id/meetings/your-meeting-id/recording.mp4"
     }'
   ```

## Verification

After configuring QStash:

1. **Upload a new meeting**
2. **Check QStash dashboard** - You should see messages appearing
3. **Check meeting status** - Should progress: UPLOADING → PROCESSING → DRAFT_READY
4. **Check server logs** - Should see "Transcribing meeting..." messages

## Troubleshooting

**If jobs still don't process:**
- Check `NEXT_PUBLIC_APP_URL` is set correctly in `.env` (should be `http://localhost:3001` for your setup)
- Check QStash dashboard for failed messages
- Check server logs for errors

**If webhook verification fails:**
- Make sure `QSTASH_CURRENT_SIGNING_KEY` is set correctly
- In development, webhook verification is skipped (only in production)

## Next Steps

Once QStash is configured:
1. New uploads will automatically process ✅
2. Meetings will progress through the pipeline ✅
3. Transcripts will appear in the viewer ✅

