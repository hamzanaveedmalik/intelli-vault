# EPIC 1 Testing Guide

This guide will help you test all features implemented in EPIC 1: Foundation.

## Prerequisites

### 1. Environment Variables

Create a `.env` file in the `ria-compliance-tool` directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ria_compliance?schema=public"

# Auth (NextAuth)
AUTH_SECRET="your-secret-key-here" # Generate with: openssl rand -base64 32
AUTH_DISCORD_ID="your-discord-client-id"
AUTH_DISCORD_SECRET="your-discord-client-secret"

# Storage (S3/R2) - For testing, you can use localstack or skip for now
S3_BUCKET_NAME="test-bucket"
S3_ACCESS_KEY_ID="test"
S3_SECRET_ACCESS_KEY="test"
S3_REGION="us-east-1"
# S3_ENDPOINT="http://localhost:4566" # For localstack

# QStash (Optional for basic testing)
QSTASH_TOKEN="your-qstash-token" # Optional - can skip for initial testing

# Email (Optional for basic testing)
RESEND_API_KEY="your-resend-key" # Optional - will log to console in dev mode
EMAIL_FROM="noreply@example.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Database Setup

Run database migrations:

```bash
cd ria-compliance-tool
npx prisma migrate dev --name init
```

Or use `db:push` for development:

```bash
npm run db:push
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Test Scenarios

### Test 1: Workspace Creation

**Steps:**

1. Navigate to `http://localhost:3000`
2. Sign in with Discord (or your auth provider)
3. You should be redirected to `/workspaces/new`
4. Enter a workspace name (e.g., "Test RIA Firm")
5. Click "Create Workspace"

**Expected Results:**

- ✅ Workspace is created
- ✅ You are redirected to `/dashboard`
- ✅ Workspace appears in database
- ✅ Audit event is logged

**Verify in Database:**

```sql
SELECT * FROM "Workspace";
SELECT * FROM "UserWorkspace";
SELECT * FROM "AuditEvent" WHERE "resourceType" = 'workspace';
```

### Test 2: Dashboard View

**Steps:**

1. After creating workspace, you should see the dashboard
2. Dashboard should show "No meetings yet" message
3. Click "Upload Meeting" button

**Expected Results:**

- ✅ Dashboard loads without errors
- ✅ Empty state message is displayed
- ✅ Upload button is visible and clickable

### Test 3: File Upload

**Steps:**

1. Navigate to `/upload`
2. Fill in the form:
   - Select a test audio/video file (mp3, mp4, wav, or m4a)
   - Enter client name: "John Smith"
   - Enter meeting type: "Annual Review"
   - Select meeting date
   - Check consent checkbox
3. Click "Upload"

**Expected Results:**

- ✅ File validation works (try invalid file types)
- ✅ File is uploaded to S3/R2 (or fails gracefully if not configured)
- ✅ Meeting record is created with status "UPLOADING"
- ✅ Meeting status changes to "PROCESSING" (if QStash is configured)
- ✅ You are redirected to meeting detail page
- ✅ Audit event is logged

**Verify in Database:**

```sql
SELECT * FROM "Meeting" ORDER BY "createdAt" DESC LIMIT 1;
SELECT * FROM "AuditEvent" WHERE "action" = 'UPLOAD' ORDER BY "timestamp" DESC LIMIT 1;
```

### Test 4: Meeting List on Dashboard

**Steps:**

1. After uploading a meeting, navigate back to `/dashboard`
2. Verify the meeting appears in the list

**Expected Results:**

- ✅ Meeting appears in the table
- ✅ Client name, meeting type, date, and status are displayed
- ✅ Status badge has correct color
- ✅ "View" link works

### Test 5: Meeting Detail Page

**Steps:**

1. Click "View" on a meeting from the dashboard
2. Or navigate to `/meetings/{meetingId}`

**Expected Results:**

- ✅ Meeting details are displayed
- ✅ Status is shown correctly
- ✅ All metadata is visible

### Test 6: Workspace Settings

**Steps:**

1. Navigate to `/settings`
2. Update retention years (try values 5-10)
3. Toggle legal hold
4. Click "Save Settings"

**Expected Results:**

- ✅ Only OWNER_CCO can access (test with MEMBER role)
- ✅ Settings update successfully
- ✅ Changes are saved to database
- ✅ Audit event is logged

**Verify in Database:**

```sql
SELECT * FROM "Workspace" WHERE "id" = 'your-workspace-id';
SELECT * FROM "AuditEvent" WHERE "resourceType" = 'workspace' ORDER BY "timestamp" DESC LIMIT 1;
```

### Test 7: User Invitation (Optional - requires email setup)

**Steps:**

1. Navigate to `/workspaces/{workspaceId}/invite`
2. Enter an email address
3. Select a role (OWNER_CCO or MEMBER)
4. Click "Send Invitation"

**Expected Results:**

- ✅ Invitation is created in database
- ✅ Email is sent (or logged to console in dev mode)
- ✅ Invitation link is generated
- ✅ Audit event is logged

**Test Invitation Acceptance:**

1. Copy the invitation link from console/logs
2. Open in incognito/private browser
3. Sign in with the invited email
4. Accept invitation

**Expected Results:**

- ✅ UserWorkspace record is created
- ✅ User can access the workspace
- ✅ Role is assigned correctly

### Test 8: Billing Setup

**Steps:**

1. Make API call to `/api/billing/setup`:

```bash
curl -X POST http://localhost:3000/api/billing/setup \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"workspaceId": "your-workspace-id", "pilotCode": "FREEPILOT"}'
```

**Expected Results:**

- ✅ Workspace billing status updated to PILOT
- ✅ Pilot start date is set
- ✅ Audit event is logged

**Verify in Database:**

```sql
SELECT "billingStatus", "pilotStartDate" FROM "Workspace" WHERE "id" = 'your-workspace-id';
```

## Error Testing

### Test Invalid File Uploads

1. Try uploading file > 500 MB → Should show error
2. Try uploading invalid file type → Should show error
3. Try uploading without consent → Should show error
4. Try uploading without required fields → Should show validation errors

### Test Authentication

1. Try accessing `/dashboard` without auth → Should redirect to sign in
2. Try accessing `/settings` as MEMBER → Should redirect to dashboard
3. Try accessing `/workspaces/{id}/invite` as MEMBER → Should return 403

### Test Workspace Isolation

1. Create two workspaces
2. Upload meeting to workspace 1
3. Try to access meeting from workspace 2 → Should return 404

## Database Verification Queries

```sql
-- Check all workspaces
SELECT * FROM "Workspace";

-- Check all meetings
SELECT id, "clientName", "meetingType", status, "workspaceId" FROM "Meeting";

-- Check all audit events
SELECT "action", "resourceType", "resourceId", "timestamp" FROM "AuditEvent" ORDER BY "timestamp" DESC;

-- Check user workspace memberships
SELECT u.email, w.name, uw.role FROM "User" u
JOIN "UserWorkspace" uw ON u.id = uw."userId"
JOIN "Workspace" w ON uw."workspaceId" = w.id;

-- Check invitations
SELECT email, role, "expiresAt", "acceptedAt" FROM "Invitation";
```

## Common Issues & Solutions

### Issue: Database connection error

**Solution:** Ensure PostgreSQL is running and DATABASE_URL is correct

### Issue: Auth redirect loop

**Solution:** Check AUTH_SECRET is set and valid

### Issue: File upload fails

**Solution:**

- For testing, you can mock S3 or use localstack
- Or modify upload route to skip S3 upload in dev mode

### Issue: QStash job not processing

**Solution:**

- QStash is optional for basic testing
- Job processing will be implemented in EPIC 2
- For now, meeting status will stay in PROCESSING

### Issue: TypeScript errors

**Solution:** Run `npm run typecheck` to see specific errors

## Next Steps After Testing

Once EPIC 1 is verified:

1. Document any issues found
2. Proceed to EPIC 2: Transcription Pipeline
3. Set up production environment variables
4. Configure production S3/R2 bucket
5. Set up production QStash account
