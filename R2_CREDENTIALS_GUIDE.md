# Getting R2 S3-Compatible Credentials

**Important**: There are TWO different types of tokens in Cloudflare:

1. **Account API Tokens** (what you just created) - For Cloudflare REST API
2. **R2 API Tokens** (what we need) - For S3-compatible access

We need **R2 API Tokens** which give us Access Key ID and Secret Access Key (like AWS S3).

---

## Step 1: Go to R2 API Tokens

1. In Cloudflare dashboard, go to **R2** (in the left sidebar under "Build")
2. Click on **Manage R2 API Tokens** (top right, next to "Create bucket")
   - OR go directly to: https://dash.cloudflare.com/r2/api-tokens

---

## Step 2: Create R2 API Token

1. Click **Create API token**
2. Enter a name: `RIA Compliance Tool - S3 Access`
3. Click **Create API token**

---

## Step 3: Copy Your Credentials

You'll see:
- **Access Key ID** → This is your `S3_ACCESS_KEY_ID`
- **Secret Access Key** → This is your `S3_SECRET_ACCESS_KEY`

**IMPORTANT**: Copy both immediately - you won't see the Secret Access Key again!

---

## Step 4: Get Your Account ID

Your Account ID is visible in:
- The dashboard URL: `dash.cloudflare.com/[ACCOUNT_ID]/...`
- Or go to R2 → Your bucket → Settings → The endpoint shows it

---

## Step 5: Add to .env

Add these to your `.env` file:

```bash
# Cloudflare R2 Configuration
S3_BUCKET_NAME="ria-compliance-recordings"  # Your bucket name
S3_ACCESS_KEY_ID="[paste Access Key ID from Step 3]"
S3_SECRET_ACCESS_KEY="[paste Secret Access Key from Step 3]"
S3_REGION="auto"
S3_ENDPOINT="https://[YOUR-ACCOUNT-ID].r2.cloudflarestorage.com"
```

**Note**: The token you shared (`CLOUDFLARE_R2_API_TOKEN`) is for Cloudflare's REST API, not S3-compatible access. We need the R2 API tokens instead.

---

## Quick Reference

- **Account API Tokens**: For Cloudflare REST API (dash.cloudflare.com/profile/api-tokens)
- **R2 API Tokens**: For S3-compatible access (dash.cloudflare.com/r2/api-tokens) ← **We need this one**

---

## Troubleshooting

**Can't find "Manage R2 API Tokens"?**
- Make sure you've enabled R2 in your account
- Try creating a bucket first, then the option will appear

**Don't see R2 in sidebar?**
- R2 might not be enabled for your account
- Go to R2 dashboard and enable it if prompted

