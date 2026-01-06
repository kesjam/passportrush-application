// Storage utilities for the worker (without presigner for simpler imports)
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  ...(process.env.S3_ENDPOINT && { endpoint: process.env.S3_ENDPOINT }),
})

const BUCKET = process.env.S3_BUCKET || "passportrush-storage"

export interface UploadOptions {
  key: string
  body: Buffer
  contentType: string
  metadata?: Record<string, string>
}

export async function uploadToS3(options: UploadOptions): Promise<string> {
  const { key, body, contentType, metadata } = options

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      Metadata: metadata,
    })
  )

  return key
}

export async function downloadFromS3(key: string): Promise<Buffer> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })

  const response = await s3Client.send(command)

  if (!response.Body) {
    throw new Error("Empty response from S3")
  }

  const chunks: Uint8Array[] = []
  for await (const chunk of response.Body as any) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}

export { BUCKET }
