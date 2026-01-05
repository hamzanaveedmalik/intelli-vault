# Cloudflare R2 Setup Guide (Recommended)

R2 is the best choice for development and production because:

- ✅ **Free tier**: 10GB storage + 1M operations/month (plenty for testing)
- ✅ **No egress fees**: Unlike AWS S3, you don't pay for downloads
- ✅ **S3-compatible**: Works with existing AWS SDK code
- ✅ **Fast setup**: 5-10 minutes to configure
- ✅ **Production-ready**: Can use the same setup for production

---

## Step-by-Step Setup

### Step 1: Create Cloudflare Account

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up (free account is sufficient)
3. Verify your email

### Step 2: Enable R2

1. In Cloudflare dashboard, go to **R2** in the sidebar
2. Click **Get Started** or **Create bucket**
3. If prompted, agree to the R2 terms

### Step 3: Create a Bucket

1. Click **Create bucket**
2. Bucket name: `ria-compliance-recordings` (or any name you prefer)
3. Location: Choose closest region (e.g., `WNAM` for Western North America)
4. Click **Create bucket**

**Note your bucket name** → This is `S3_BUCKET_NAME`

### Step 4: Create API Token

1. In R2 dashboard, click **Manage R2 API Tokens** (top right)
2. Or go to: https://dash.cloudflare.com/profile/api-tokens
3. Click **Create Token**
4. Use **Edit Cloudflare Workers** template (or create custom)
5. For custom token:
   - **Permissions**:
     - Account → R2 → Edit
   - **Account Resources**:
     - Include → Specific account → Select your account
   - **Zone Resources**:
     - Include → All zones (or specific zones)
6. Click **Continue to summary** → **Create Token**
7. **IMPORTANT**: Copy the token immediately (you won't see it again!)

You'll get:

- **Access Key ID** → This is `S3_ACCESS_KEY_ID`
- **Secret Access Key** → This is `S3_SECRET_ACCESS_KEY`

### Step 5: Get Your Account ID

1. In Cloudflare dashboard, go to any page
2. Look at the URL or sidebar - you'll see your **Account ID**
3. Or go to: https://dash.cloudflare.com → Right sidebar shows Account ID

### Step 6: Construct R2 Endpoint URL

Format: `https://[ACCOUNT_ID].r2.cloudflarestorage.com`

Example: `https://abc123def456.r2.cloudflarestorage.com`

This is your `S3_ENDPOINT`

---

## Step 7: Add to .env File

Add these variables to your `.env` file:

```bash
# Cloudflare R2 Configuration
S3_BUCKET_NAME="ria-compliance-recordings"
S3_ACCESS_KEY_ID="your-access-key-id-from-step-4"
S3_SECRET_ACCESS_KEY="your-secret-access-key-from-step-4"
S3_REGION="auto"
S3_ENDPOINT="https://[YOUR-ACCOUNT-ID].r2.cloudflarestorage.com"
```

**Replace:**

- `[YOUR-ACCOUNT-ID]` with your actual Cloudflare Account ID from Step 5

---

## Step 8: Test the Setup

### Option A: Test via Code

The app will test automatically when you try to upload a file.

### Option B: Test via AWS CLI (if installed)

```bash
# Install AWS CLI if needed
# brew install awscli  # macOS
# or download from: https://aws.amazon.com/cli/

# Configure (use your R2 credentials)
aws configure set aws_access_key_id YOUR_ACCESS_KEY_ID
aws configure set aws_secret_access_key YOUR_SECRET_ACCESS_KEY

# Test upload (replace with your values)
aws s3 cp test-file.txt s3://ria-compliance-recordings/test/ \
  --endpoint-url https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
```

---

## Troubleshooting

### Error: "Access Denied"

- Check that your API token has R2 Edit permissions
- Verify Account ID in endpoint URL is correct

### Error: "Bucket not found"

- Verify bucket name matches exactly (case-sensitive)
- Check bucket exists in R2 dashboard

### Error: "Invalid endpoint"

- Ensure endpoint URL format is correct: `https://[ACCOUNT_ID].r2.cloudflarestorage.com`
- No trailing slash
- Include `https://`

### Files not appearing in R2 dashboard

- Wait a few seconds (R2 dashboard may have slight delay)
- Check bucket name in code matches dashboard

---

## Cost Comparison

### Cloudflare R2 (Recommended)

- **Storage**: Free up to 10GB, then $0.015/GB/month
- **Operations**: Free up to 1M/month, then $4.50 per million
- **Egress**: **FREE** (unlimited)
- **Estimated cost for testing**: $0/month

### AWS S3

- **Storage**: $0.023/GB/month (first 50GB)
- **Operations**: $0.005 per 1,000 requests
- **Egress**: $0.09/GB (first 10TB)
- **Estimated cost for testing**: $1-5/month (depending on usage)

### Dummy Values

- **Cost**: $0
- **Functionality**: ❌ File uploads will fail
- **Use case**: Only for testing non-upload features

---

## Production Considerations

The same R2 setup works for production:

- Scale to larger buckets as needed
- Add bucket policies for security (if needed)
- Consider enabling public access for exports (if needed)
- Monitor usage in Cloudflare dashboard

---

## Next Steps

After setting up R2:

1. Add credentials to `.env` file
2. Restart dev server: `npm run dev`
3. Test file upload in the app
4. Verify files appear in R2 dashboard

You're all set! 🎉
