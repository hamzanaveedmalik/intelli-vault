# Quick Start - EPIC 1 Testing

## Step 1: Environment Setup

Create a `.env` file in the `ria-compliance-tool` directory:

```bash
# Minimum required for testing
DATABASE_URL="postgresql://user:password@localhost:5432/ria_compliance?schema=public"
AUTH_SECRET="$(openssl rand -base64 32)"
AUTH_DISCORD_ID="your-discord-id"
AUTH_DISCORD_SECRET="your-discord-secret"

# Storage (can use dummy values for initial testing)
S3_BUCKET_NAME="test-bucket"
S3_ACCESS_KEY_ID="test"
S3_SECRET_ACCESS_KEY="test"
S3_REGION="us-east-1"

# Optional (can skip for basic testing)
QSTASH_TOKEN=""
RESEND_API_KEY=""
EMAIL_FROM="noreply@test.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Step 2: Database Setup

```bash
# Generate Prisma client
npm run postinstall

# Create database migration
npx prisma migrate dev --name init

# Or push schema directly (for development)
npm run db:push
```

## Step 3: Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## Step 4: Quick Test Checklist

- [ ] Sign in with Discord
- [ ] Create a workspace
- [ ] View dashboard (should be empty)
- [ ] Upload a test meeting file
- [ ] View meeting in dashboard
- [ ] View meeting details
- [ ] Access settings page (as OWNER_CCO)
- [ ] Update workspace settings

## Testing Without External Services

For initial testing, you can:

1. **Skip S3 Upload**: Modify `src/app/api/upload/route.ts` to skip S3 upload in dev mode
2. **Skip QStash**: Jobs won't process, but uploads will work
3. **Skip Email**: Invitations will log to console instead

## Common Commands

```bash
# Type check
npm run typecheck

# Database studio (visual DB browser)
npm run db:studio

# Generate Prisma client
npx prisma generate

# View database
npx prisma studio
```


