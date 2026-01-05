# Creating R2 API Token - Step by Step

You're on the API tokens page. Here's exactly what to do:

## Step 1: Click "Get started" under "Custom token"

Click the blue **"Get started"** button next to "Create Custom Token" (not the templates).

## Step 2: Configure Token Permissions

You'll see a form. Fill it out like this:

### Token Name
- Enter: `RIA Compliance Tool - R2 Access`
- (Or any name you prefer)

### Permissions Section

1. **Account** → **R2** → Select **Edit**
   - This gives read/write access to R2 buckets

2. **Account Resources**
   - Select **Include** → **Specific account**
   - Select your account from the dropdown

3. **Zone Resources** (if shown)
   - You can leave this as "All zones" or skip if not required
   - R2 doesn't require zone permissions

### Continue
- Click **Continue to summary**
- Review the permissions
- Click **Create Token**

## Step 3: Copy Your Credentials

**IMPORTANT**: Copy these immediately - you won't see them again!

You'll see:
- **Access Key ID** → This is your `S3_ACCESS_KEY_ID`
- **Secret Access Key** → This is your `S3_SECRET_ACCESS_KEY`

Copy both to a safe place (or directly into your `.env` file).

## Step 4: Get Your Account ID

1. Look at the Cloudflare dashboard URL or sidebar
2. Your Account ID is visible in the URL or sidebar
3. Or go to any R2 bucket page - the Account ID is in the endpoint URL

Format: `https://[ACCOUNT_ID].r2.cloudflarestorage.com`

## Step 5: Add to .env

Add these to your `.env` file:

```bash
S3_BUCKET_NAME="ria-compliance-recordings"  # Or your bucket name
S3_ACCESS_KEY_ID="[paste Access Key ID from Step 3]"
S3_SECRET_ACCESS_KEY="[paste Secret Access Key from Step 3]"
S3_REGION="auto"
S3_ENDPOINT="https://[YOUR-ACCOUNT-ID].r2.cloudflarestorage.com"
```

## Troubleshooting

**If you don't see R2 in permissions:**
- Make sure R2 is enabled in your account
- Go to R2 dashboard first, create a bucket, then come back to API tokens

**If you lost your Secret Access Key:**
- You'll need to create a new token (old one won't work)
- Delete the old token and create a new one

**If you can't find Account ID:**
- Go to R2 → Your bucket → Settings
- The endpoint URL shows your Account ID
- Or check the dashboard URL: `dash.cloudflare.com/[ACCOUNT_ID]/...`

