# PassportRush

A production-ready web application for creating U.S. passport photos online. Users can upload photos, get automated compliance checks, and download print-ready and digital files.

## Features

- **Two Modes**:
  - Print & Mail (2×2 photos + 4-up print sheet)
  - Online Renewal (optimized digital file)
- **Automated Processing**: Face detection, background analysis, size compliance
- **Stripe Payments**: $15 one-time checkout with secure webhooks
- **OAuth Authentication**: Google + Apple sign-in via NextAuth
- **S3 Storage**: Private buckets with signed URL downloads
- **Worker Queue**: Background image processing with job polling
- **SEO Optimized**: Marketing pages with JSON-LD schema
- **Mobile-First UI**: Modern, premium design with shadcn/ui

## Tech Stack

- **Framework**: Next.js 14+ (App Router) + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth (Auth.js) with Google & Apple OAuth
- **Payments**: Stripe Checkout + Webhooks
- **Storage**: AWS S3 or Cloudflare R2
- **Image Processing**: Sharp + face-api.js
- **Styling**: TailwindCSS + shadcn/ui components

## Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud)
- AWS S3 or Cloudflare R2 account
- Stripe account
- Google OAuth credentials
- (Optional) Apple OAuth credentials

## Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd passportrush
npm install
```

### 2. Database Setup

Create a PostgreSQL database and copy the connection string.

```bash
# Copy environment template
cp .env.example .env

# Edit .env and add your DATABASE_URL
# Example: DATABASE_URL="postgresql://user:password@localhost:5432/passportrush"
```

### 3. Run Migrations

```bash
npm run db:push
# or
npm run db:migrate
```

### 4. Configure Environment Variables

Edit `.env` with your credentials:

#### Required Variables

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate with: openssl rand -base64 32>"

# Google OAuth (get from Google Cloud Console)
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Stripe (get from Stripe Dashboard)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# S3 Storage (AWS or R2)
S3_REGION="us-east-1"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET="passportrush-storage"

# Optional: For Cloudflare R2
# S3_ENDPOINT="https://account-id.r2.cloudflarestorage.com"
```

#### Optional Variables

```env
# Apple OAuth (optional)
APPLE_CLIENT_ID="com.your.app.id"
APPLE_CLIENT_SECRET="<generated JWT>"

# Signed URL TTL
SIGNED_URL_TTL_SECONDS="3600"
SIGNED_URL_DOWNLOAD_TTL_SECONDS="86400"
```

### 5. Set Up OAuth Providers

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env`

#### Apple OAuth (Optional)

1. Go to [Apple Developer](https://developer.apple.com/)
2. Create an App ID and Service ID
3. Configure Sign in with Apple
4. Generate private key and create JWT
5. Add credentials to `.env`

### 6. Set Up Stripe

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get API keys from Developers → API keys
3. Set up webhook endpoint:
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`
   - Copy webhook secret to `.env`

**For local development:**

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copy the webhook signing secret to .env as STRIPE_WEBHOOK_SECRET
```

### 7. Set Up S3 Storage

#### Option A: AWS S3

1. Create S3 bucket (private, block all public access)
2. Create IAM user with S3 full access
3. Add credentials to `.env`

#### Option B: Cloudflare R2

1. Create R2 bucket in Cloudflare dashboard
2. Generate API token
3. Add endpoint and credentials to `.env`

### 8. Download Face Detection Models (Optional)

For face detection to work, download the face-api.js models:

```bash
# Create models directory
mkdir -p models

# Download models from:
# https://github.com/vladmandic/face-api/tree/master/model

# Required files:
# - ssdMobilenetv1_model-weights_manifest.json
# - ssdMobilenetv1_model-shard1
# - face_landmark_68_model-weights_manifest.json
# - face_landmark_68_model-shard1
# - face_recognition_model-weights_manifest.json
# - face_recognition_model-shard1/2

# Place all files in /models directory
```

## Running the Application

### Development

Terminal 1 - Next.js Dev Server:
```bash
npm run dev
```

Terminal 2 - Worker (Image Processing):
```bash
npm run worker
```

Visit `http://localhost:3000`

### Production

Build and start:
```bash
npm run build
npm start
```

Run worker separately (see deployment section).

## Development Workflow

### Database Management

```bash
# Generate Prisma client after schema changes
npm run db:generate

# Create and apply migration
npm run db:migrate

# Push schema without migration (faster for dev)
npm run db:push

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Testing Stripe Payments

Use Stripe test card numbers:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

## Deployment

### Vercel (Web App)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

**Important**: The worker must run separately (see below).

### Worker Deployment

The image processing worker should run as a separate service:

#### Option 1: Railway/Render

1. Create new service
2. Set build command: `npm install`
3. Set start command: `npm run worker`
4. Add environment variables
5. Deploy

#### Option 2: Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npx prisma generate
CMD ["npm", "run", "worker"]
```

#### Option 3: Background Job Service

Use services like:
- AWS ECS/Fargate
- Google Cloud Run Jobs
- DigitalOcean App Platform

### Database

Use managed PostgreSQL:
- Vercel Postgres
- Railway
- Supabase
- AWS RDS
- Neon

### Storage

- **AWS S3**: Production-ready, pay-as-you-go
- **Cloudflare R2**: S3-compatible, cheaper egress

## Architecture

```
User Flow:
1. Guest uploads photo → /upload
2. Job created (QUEUED) → saved to DB
3. Worker polls for jobs → processes image → saves outputs to S3
4. User sees watermarked proof → /proof/[jobId]
5. User signs in (OAuth) → Stripe Checkout
6. Webhook confirms payment → creates entitlement
7. User downloads final assets → /download/[jobId]
8. Assets stored in "My Photos" library
```

### Key Directories

```
passportrush/
├── app/
│   ├── (marketing)/          # Marketing pages
│   ├── (seo)/                # SEO content pages
│   ├── api/                  # API routes
│   │   ├── upload/           # File upload
│   │   ├── jobs/             # Job status
│   │   ├── stripe/           # Checkout + webhook
│   │   └── assets/           # Download with entitlement check
│   ├── start/                # Mode selection
│   ├── upload/               # Upload UI
│   ├── proof/[jobId]/        # Proof preview
│   ├── download/[jobId]/     # Download page
│   └── account/photos/       # Library
├── lib/
│   ├── auth.ts               # NextAuth config
│   ├── prisma.ts             # Prisma client
│   ├── storage.ts            # S3 utilities
│   ├── storage-worker.ts     # Worker S3 utils
│   └── image-processor.ts    # Core processing logic
├── components/
│   └── ui/                   # shadcn/ui components
├── prisma/
│   └── schema.prisma         # Database schema
├── worker.ts                 # Background job processor
└── .env                      # Environment variables
```

## Security

- **Signed URLs**: All S3 access via time-limited signed URLs
- **Entitlement Checks**: Downloads require completed payment
- **Webhook Verification**: Stripe signature validation
- **Rate Limiting**: Per-IP upload limits (TODO: implement)
- **File Validation**: Type and size checks on upload
- **Private Buckets**: No public S3 access

## Compliance

- Photos are formatted and checked against published U.S. passport requirements
- No guarantee of acceptance by government agencies (disclaimer required)
- "Strict Mode" default: no background editing (safest)
- "Assisted Mode" option: background replacement with clear disclosure

## Copy Guidelines

✅ Use:
- "Formatted and checked for U.S. requirements"
- "Optimized for passport applications"
- "Meets published specifications"

❌ Avoid:
- "Guaranteed acceptance"
- "Officially approved"
- "Government-certified"

## Troubleshooting

### Worker Not Processing Jobs

- Check database connection in worker logs
- Verify S3 credentials and bucket access
- Ensure face-api models are downloaded
- Check job status in database: `npm run db:studio`

### Image Upload Fails

- Check S3 credentials
- Verify bucket exists and is accessible
- Check file size limits (10MB default)
- Review API logs for errors

### Stripe Webhook Fails

- Verify webhook secret matches `.env`
- Check webhook endpoint is accessible
- Review Stripe Dashboard → Webhooks for failed events
- Ensure raw body parsing is disabled in webhook route

### Face Detection Not Working

- Download face-api models to `/models`
- Check model files are not corrupted
- Review worker logs for loading errors
- Face detection is optional; worker will continue without it

## License

Proprietary - All rights reserved

## Support

For issues and questions, create an issue in the repository.

---

Built with Next.js, Prisma, Stripe, and Sharp.
