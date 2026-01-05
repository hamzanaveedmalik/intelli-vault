# Step-by-Step Setup Guide

This guide walks you through setting up all environment variables and configurations needed to run the RIA Compliance Tool locally.

## Prerequisites

Before starting, ensure you have:

- Node.js 18+ installed
- PostgreSQL database (local or remote)
- Discord account (for OAuth authentication)

---

## Step 1: Database Setup

### 1.1 Create PostgreSQL Database

**Option A: Local PostgreSQL**

```bash
# Create database
createdb ria_compliance

# Or using psql
psql -U postgres
CREATE DATABASE ria_compliance;
```

**Option B: Use a cloud service**

- [Supabase](https://supabase.com) (free tier available)
- [Neon](https://neon.tech) (free tier available)
- [Railway](https://railway.app) (free tier available)

### 1.2 Get Database URL

Format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public`

**Example (local):**

```
postgresql://postgres:password@localhost:5432/ria_compliance?schema=public
```

**Example (Supabase):**

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?schema=public
```

---

## Step 2: Discord OAuth Setup (Required for Authentication)

### 2.1 Create Discord Application

1. Go to https://discord.com/developers/applications
2. Click "New Application"
3. Name it (e.g., "RIA Compliance Tool")
4. Click "Create"

### 2.2 Configure OAuth

1. Go to **OAuth2** → **General**
2. Copy the **Client ID** → This is `AUTH_DISCORD_ID`
3. Click **Reset Secret** → Copy the **Client Secret** → This is `AUTH_DISCORD_SECRET`
4. Under **Redirects**, add:
   ```
   http://localhost:3000/api/auth/callback/discord
   ```

### 2.3 Get Your Credentials

- `AUTH_DISCORD_ID`: Your Client ID
- `AUTH_DISCORD_SECRET`: Your Client Secret

---

## Step 3: Generate Auth Secret

This is used to encrypt session cookies.

```bash
# Generate a random secret
openssl rand -base64 32
```

Copy the output → This is `AUTH_SECRET`

---

## Step 4: Storage Setup (S3/R2)

**Recommendation: Use Cloudflare R2** (see `R2_SETUP_GUIDE.md` for detailed steps)

### Why R2?

- ✅ Free tier: 10GB + 1M operations/month (perfect for testing)
- ✅ No egress fees (unlike AWS S3)
- ✅ S3-compatible (works with existing code)
- ✅ 5-10 minute setup
- ✅ Production-ready

### Quick R2 Setup (5 minutes)

1. **Create Cloudflare account**: https://dash.cloudflare.com/sign-up
2. **Enable R2**: Dashboard → R2 → Create bucket
3. **Create API token**: Profile → API Tokens → Create Token (R2 Edit permissions)
4. **Get Account ID**: Dashboard sidebar or URL
5. **Add to .env**:
   ```bash
   S3_BUCKET_NAME="your-bucket-name"
   S3_ACCESS_KEY_ID="your-access-key"
   S3_SECRET_ACCESS_KEY="your-secret-key"
   S3_REGION="auto"
   S3_ENDPOINT="https://[YOUR-ACCOUNT-ID].r2.cloudflarestorage.com"
   ```

**See `R2_SETUP_GUIDE.md` for complete step-by-step instructions.**

### Alternative Options

**Option A: AWS S3** (if you prefer AWS ecosystem)

- More complex setup (IAM users, policies)
- Costs money even for testing (~$1-5/month)
- See AWS S3 documentation

**Option C: Dummy Values** (for testing non-upload features only)

- File uploads will fail
- Only use if you're not testing upload functionality
- Not recommended for EPIC 1 testing

---

## Step 5: QStash Setup (Optional - for Background Jobs)

QStash is used for async processing (transcription, extraction). It's optional for basic testing.

### 5.1 Create Upstash Account

1. Go to [Upstash Console](https://console.upstash.com)
2. Sign up (free tier available)
3. Go to **QStash** → **Dashboard**
4. Copy your **Token** → This is `QSTASH_TOKEN`

### 5.2 For Testing Without QStash

Leave `QSTASH_TOKEN` empty. Jobs won't process, but the app will run.

---

## Step 6: Transcription Setup (Required for EPIC 2+)

Choose one transcription provider:

### Option A: Deepgram (Recommended)

1. Go to [Deepgram](https://deepgram.com)
2. Sign up (free tier: 12,000 minutes/month)
3. Go to **API Keys** → Create new key
4. Copy the key → This is `DEEPGRAM_API_KEY`

### Option B: AssemblyAI

1. Go to [AssemblyAI](https://www.assemblyai.com)
2. Sign up (free tier: 5 hours/month)
3. Get your API key from dashboard
4. Copy the key → This is `ASSEMBLYAI_API_KEY`

### 6.1 Add to .env

```bash
# Choose one provider
TRANSCRIPTION_PROVIDER="deepgram"  # or "assemblyai"
DEEPGRAM_API_KEY="your-deepgram-key"  # If using Deepgram
ASSEMBLYAI_API_KEY="your-assemblyai-key"  # If using AssemblyAI
```

---

## Step 7: Email Setup (Optional - for Invitations & Notifications)

Resend is used to send invitation emails and draft ready notifications. Optional for basic testing.

### 7.1 Create Resend Account

1. Go to [Resend](https://resend.com)
2. Sign up (free tier: 3,000 emails/month)
3. Go to **API Keys** → Create new key
4. Copy the key → This is `RESEND_API_KEY`
5. Verify your domain (or use their test domain)

### 7.2 Set Email From Address

- `EMAIL_FROM`: Your verified email (e.g., `noreply@yourdomain.com`)
- Or use Resend's test domain: `onboarding@resend.dev`

### 7.3 For Testing Without Email

Leave `RESEND_API_KEY` empty. Emails will log to console instead.

---

## Step 7: Create .env File

Create a `.env` file in the `ria-compliance-tool` directory:

```bash
cd ria-compliance-tool
touch .env
```

### 7.1 Minimum Required Variables

```bash
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@localhost:5432/ria_compliance?schema=public"

# Auth (REQUIRED)
AUTH_SECRET="your-generated-secret-here"
AUTH_DISCORD_ID="your-discord-client-id"
AUTH_DISCORD_SECRET="your-discord-client-secret"

# Storage (REQUIRED - but can use dummy values for testing)
S3_BUCKET_NAME="your-bucket-name"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_REGION="us-east-1"
# S3_ENDPOINT="https://xxx.r2.cloudflarestorage.com"  # Only for R2

# App URL (OPTIONAL - defaults to localhost:3000)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 7.2 Optional Variables

```bash
# QStash (OPTIONAL - for background jobs)
QSTASH_TOKEN="your-qstash-token"

# Email (OPTIONAL - for invitations)
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="noreply@yourdomain.com"
```

### 7.3 Complete Example .env File

```bash
# ============================================
# REQUIRED - Database
# ============================================
DATABASE_URL="postgresql://postgres:password@localhost:5432/ria_compliance?schema=public"

# ============================================
# REQUIRED - Authentication
# ============================================
AUTH_SECRET="your-generated-secret-from-openssl-rand-base64-32"
AUTH_DISCORD_ID="123456789012345678"
AUTH_DISCORD_SECRET="abcdefghijklmnopqrstuvwxyz123456"

# ============================================
# REQUIRED - Storage (S3/R2)
# ============================================
S3_BUCKET_NAME="ria-compliance-recordings"
S3_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
S3_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
S3_REGION="us-east-1"
# For Cloudflare R2, uncomment and set:
# S3_ENDPOINT="https://xxx.r2.cloudflarestorage.com"

# ============================================
# OPTIONAL - Background Jobs (QStash)
# ============================================
# QSTASH_TOKEN="qst_xxxxxxxxxxxxx"

# ============================================
# OPTIONAL - Email (Resend)
# ============================================
# RESEND_API_KEY="re_xxxxxxxxxxxxx"
# EMAIL_FROM="noreply@yourdomain.com"

# ============================================
# OPTIONAL - App Configuration
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

## Step 8: Initialize Database Schema

After setting up your `.env` file:

```bash
cd ria-compliance-tool

# Generate Prisma client
npm run postinstall

# Push schema to database (for development)
npm run db:push

# OR create a migration (for production)
npx prisma migrate dev --name init
```

---

## Step 9: Verify Setup

### 9.1 Check Environment Variables

```bash
# The app will validate env vars on startup
npm run dev
```

If you see errors about missing variables, check your `.env` file.

### 9.2 Test Database Connection

```bash
# Open Prisma Studio to view your database
npm run db:studio
```

This opens a visual database browser at `http://localhost:5555`

### 9.3 Run Type Check

```bash
npm run typecheck
```

Should pass without errors.

---

## Step 10: Start Development Server

```bash
npm run dev
```

Visit: `http://localhost:3000`

---

## Quick Reference: Variable Priority

### 🔴 Critical (App won't start without these)

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_DISCORD_ID`
- `AUTH_DISCORD_SECRET`
- `S3_BUCKET_NAME`
- `S3_ACCESS_KEY_ID`
- `S3_SECRET_ACCESS_KEY`

### 🟡 Important (App starts, but features won't work)

- `S3_REGION` (defaults to "auto")
- `S3_ENDPOINT` (required for R2, not needed for AWS S3)

### 🟢 Optional (App works, but features are disabled)

- `QSTASH_TOKEN` (background jobs won't process)
- `RESEND_API_KEY` (invitations log to console)
- `EMAIL_FROM` (defaults to noreply@ria-compliance.com)
- `NEXT_PUBLIC_APP_URL` (defaults to http://localhost:3000)

---

## Troubleshooting

### Error: "AUTH_SECRET is required"

- Generate a secret: `openssl rand -base64 32`
- Add it to `.env`

### Error: "Invalid DATABASE_URL"

- Check your PostgreSQL connection string format
- Ensure database exists
- Test connection: `psql $DATABASE_URL`

### Error: "S3 upload failed"

- Verify S3 credentials are correct
- Check bucket exists and is accessible
- For R2, ensure `S3_ENDPOINT` is set correctly

### Error: "Discord OAuth failed"

- Verify redirect URL matches: `http://localhost:3000/api/auth/callback/discord`
- Check Client ID and Secret are correct
- Ensure Discord application is not deleted

### TypeScript Errors

- Run `npm run typecheck` to see specific errors
- Ensure all dependencies are installed: `npm install`

---

## Next Steps

Once setup is complete:

1. Run `./test-epic1.sh` to verify setup
2. Follow `TESTING_GUIDE.md` for test scenarios
3. Start implementing EPIC 2 features
