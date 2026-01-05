# Setup Checklist

Use this checklist to ensure you have everything configured before running the app.

## ✅ Prerequisites

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL database created and accessible
- [ ] Discord account (for OAuth)

---

## ✅ Step 1: Database

- [ ] PostgreSQL database created
- [ ] Database URL copied
  - Format: `postgresql://user:password@host:port/database?schema=public`
- [ ] Connection tested (optional: `psql $DATABASE_URL`)

**Variable:**
```
DATABASE_URL="postgresql://..."
```

---

## ✅ Step 2: Discord OAuth

- [ ] Discord application created at https://discord.com/developers/applications
- [ ] Client ID copied
- [ ] Client Secret copied
- [ ] Redirect URL added: `http://localhost:3000/api/auth/callback/discord`

**Variables:**
```
AUTH_DISCORD_ID="..."
AUTH_DISCORD_SECRET="..."
```

---

## ✅ Step 3: Auth Secret

- [ ] Secret generated: `openssl rand -base64 32`
- [ ] Secret copied to `.env`

**Variable:**
```
AUTH_SECRET="..."
```

---

## ✅ Step 4: Storage (S3/R2)

**Choose one option:**

### Option A: AWS S3
- [ ] S3 bucket created
- [ ] IAM user created with S3 permissions
- [ ] Access Key ID copied
- [ ] Secret Access Key copied
- [ ] Region noted

### Option B: Cloudflare R2
- [ ] R2 bucket created
- [ ] API token created
- [ ] Access Key ID copied
- [ ] Secret Access Key copied
- [ ] Endpoint URL copied

### Option C: Testing (Dummy Values)
- [ ] Using dummy values for initial testing
- [ ] Note: File uploads will fail

**Variables:**
```
S3_BUCKET_NAME="..."
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_REGION="us-east-1"
# S3_ENDPOINT="..."  # Only for R2
```

---

## ✅ Step 5: QStash (Optional)

- [ ] Upstash account created
- [ ] QStash token copied
- [ ] OR: Leave empty for testing (jobs won't process)

**Variable:**
```
QSTASH_TOKEN="..."  # Optional
```

---

## ✅ Step 6: Email (Optional)

- [ ] Resend account created
- [ ] API key copied
- [ ] Email domain verified
- [ ] OR: Leave empty for testing (emails log to console)

**Variables:**
```
RESEND_API_KEY="..."  # Optional
EMAIL_FROM="..."      # Optional
```

---

## ✅ Step 7: Create .env File

- [ ] `.env` file created in `ria-compliance-tool/` directory
- [ ] All required variables added
- [ ] All values filled in (no empty strings)

**Location:** `ria-compliance-tool/.env`

---

## ✅ Step 8: Initialize Database

- [ ] Run: `npm run postinstall` (generates Prisma client)
- [ ] Run: `npm run db:push` (syncs schema to database)
- [ ] OR: Run: `npx prisma migrate dev --name init` (creates migration)

---

## ✅ Step 9: Verify Setup

- [ ] Run: `npm run typecheck` (should pass)
- [ ] Run: `npm run dev` (should start without errors)
- [ ] Visit: `http://localhost:3000` (should load)

---

## ✅ Step 10: Test Authentication

- [ ] Click "Sign In" on homepage
- [ ] Discord OAuth flow works
- [ ] Redirected to workspace creation page

---

## Quick Commands Reference

```bash
# Generate auth secret
openssl rand -base64 32

# Test database connection
psql $DATABASE_URL

# Initialize database
cd ria-compliance-tool
npm run postinstall
npm run db:push

# Verify setup
npm run typecheck
npm run dev

# View database
npm run db:studio
```

---

## Need Help?

- See `SETUP_GUIDE.md` for detailed instructions
- See `TESTING_GUIDE.md` for testing scenarios
- Check console output for specific error messages

