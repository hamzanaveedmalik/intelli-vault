# Storage Setup Guide

This document describes how to configure S3/R2 storage for the RIA Compliance Tool.

## Storage Architecture

The application uses S3-compatible storage (AWS S3, Cloudflare R2, or other S3-compatible services) with workspace-prefixed keys for multi-tenant isolation.

### Key Pattern

Files are stored using the following pattern:
```
workspaces/{workspaceId}/meetings/{meetingId}/recording.{ext}
```

Example:
```
workspaces/clx123abc/meetings/clx456def/recording.mp4
```

### Storage Structure

```
workspaces/
  {workspaceId}/
    meetings/
      {meetingId}/
        recording.mp4          # Original upload
        transcript.json        # Transcription output (future)
        extraction.json        # LLM extraction output (future)
        exports/
          audit-pack.zip       # Generated export pack (future)
```

## Environment Variables

Add the following environment variables to your `.env` file:

### Required Variables

```bash
# S3/R2 Storage Configuration
S3_BUCKET_NAME=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key-id
S3_SECRET_ACCESS_KEY=your-secret-access-key
```

### Optional Variables

```bash
# For AWS S3 (default)
S3_REGION=us-east-1

# For Cloudflare R2
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_REGION=auto
```

## Setup Instructions

### Option 1: AWS S3

1. Create an S3 bucket in your AWS account
2. Create an IAM user with the following permissions:
   - `s3:PutObject`
   - `s3:GetObject`
   - `s3:DeleteObject` (optional, for future cleanup)
3. Generate access keys for the IAM user
4. Set environment variables:
   ```bash
   S3_BUCKET_NAME=your-bucket-name
   S3_ACCESS_KEY_ID=AKIA...
   S3_SECRET_ACCESS_KEY=...
   S3_REGION=us-east-1
   ```

### Option 2: Cloudflare R2

1. Create an R2 bucket in your Cloudflare account
2. Create an API token with R2 read/write permissions
3. Set environment variables:
   ```bash
   S3_BUCKET_NAME=your-bucket-name
   S3_ACCESS_KEY_ID=your-r2-access-key-id
   S3_SECRET_ACCESS_KEY=your-r2-secret-access-key
   S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
   S3_REGION=auto
   ```

## Security Features

- **Encryption at Rest**: Files are encrypted by default by S3/R2
- **Workspace Isolation**: All files are prefixed with workspace ID
- **Signed URLs**: File access uses signed URLs with expiration (1 hour default)
- **Access Validation**: All file operations validate workspace access

## File Validation

The system validates uploaded files:

- **Allowed Formats**: `.mp3`, `.mp4`, `.wav`, `.m4a`
- **Maximum Size**: 500 MB
- **Content Type**: Automatically detected from file extension

## Usage Example

```typescript
import { uploadFile } from "~/server/storage";
import { validateFile, getContentType } from "~/server/storage-utils";

// Validate file
const validation = validateFile(filename, fileSize);
if (!validation.valid) {
  throw new Error(validation.error);
}

// Upload file
const { key, url } = await uploadFile(
  workspaceId,
  meetingId,
  fileBuffer,
  filename,
  getContentType(filename)
);
```

## Testing

For local development, you can use:

1. **LocalStack** (S3-compatible local service)
2. **MinIO** (S3-compatible object storage)
3. **Cloudflare R2** (free tier available)

## Production Considerations

- Enable bucket versioning for audit trail
- Configure lifecycle policies for old files
- Set up bucket logging for compliance
- Use IAM roles instead of access keys when possible (AWS)
- Enable bucket encryption (KMS or default)


