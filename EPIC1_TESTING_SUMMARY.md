# EPIC 1 Testing Summary

## ✅ Status: Ready for Testing

All EPIC 1 stories have been implemented and TypeScript checks pass.

## Quick Start

### 1. Set Up Environment

Create `.env` file with minimum required variables:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/ria_compliance"
AUTH_SECRET="$(openssl rand -base64 32)"
AUTH_DISCORD_ID="your-discord-id"
AUTH_DISCORD_SECRET="your-discord-secret"
S3_BUCKET_NAME="test-bucket"
S3_ACCESS_KEY_ID="test"
S3_SECRET_ACCESS_KEY="test"
S3_REGION="us-east-1"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Initialize Database

```bash
npm run db:push
# or
npx prisma migrate dev --name init
```

### 3. Start Server

```bash
npm run dev
```

### 4. Run Test Script

```bash
./test-epic1.sh
```

## Test Scenarios

### ✅ Core Workflows

1. **Authentication & Workspace Creation**
   - Sign in → Redirected to workspace creation
   - Create workspace → Redirected to dashboard
   - Workspace appears in database

2. **File Upload**
   - Navigate to `/upload`
   - Upload test file (mp3/mp4/wav)
   - Meeting created with UPLOADING status
   - Status updates to PROCESSING (if QStash configured)

3. **Dashboard**
   - View meeting list
   - See status indicators
   - Click to view meeting details

4. **Settings Management**
   - Access `/settings` (OWNER_CCO only)
   - Update retention years
   - Toggle legal hold

### ⚠️ Optional Features (Can Skip for Initial Testing)

- **QStash Jobs**: Meeting processing (will be implemented in EPIC 2)
- **Email Invitations**: Requires Resend API key
- **S3 Upload**: Can use dummy values for initial testing

## Testing Checklist

- [ ] Environment variables configured
- [ ] Database schema synced
- [ ] Development server starts without errors
- [ ] Can sign in with Discord
- [ ] Can create workspace
- [ ] Dashboard loads and shows empty state
- [ ] Can upload a test file
- [ ] Meeting appears in dashboard
- [ ] Can view meeting details
- [ ] Can access settings (as OWNER_CCO)
- [ ] Can update workspace settings

## Known Limitations (Expected)

1. **QStash Jobs**: Jobs won't process until EPIC 2 transcription is implemented
2. **S3 Upload**: Requires actual S3/R2 credentials for production
3. **Email**: Invitations log to console in dev mode without Resend key

## Next Steps After Testing

1. Document any bugs or issues
2. Verify all acceptance criteria are met
3. Proceed to EPIC 2: Transcription Pipeline

## Files Created

- `TESTING_GUIDE.md` - Detailed testing scenarios
- `QUICK_START.md` - Quick setup instructions
- `test-epic1.sh` - Automated setup verification script
- `STORAGE_SETUP.md` - S3/R2 storage configuration guide

## Support

If you encounter issues:
1. Check `TESTING_GUIDE.md` for common solutions
2. Verify environment variables are set correctly
3. Check database connection
4. Review TypeScript errors: `npm run typecheck`


